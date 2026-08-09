# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Canonical Experiment Runner & Reproducibility Engine
#  Python scientific execution engine running baseline vs. memory-guided trials,
#  seed iterations, censored run tracking, and ALGOFORGE-EXP-XXX artifact persistence.
# ══════════════════════════════════════════════════════════════════════

import time
import os
import json
import random
import platform
from typing import List, Dict, Any, Optional

from memory.schemas import ExperimentArtifact, RunStatus, VerificationMethod, AlgorithmicStrategy
from memory.algorithmic_memory import AlgorithmicMemory
from memory.strategy_extractor import StrategyExtractor
from memory.knowledge_retriever import KnowledgeRetriever
from benchmarks.suite import BENCHMARK_SPECS, get_benchmark_tasks, check_valid_solution
from search.genetic_engine import GeneticEngine, EvolutionResult
from search.research_metrics import ResearchMetricsEngine
from dsl.ast_nodes import ProgramNode

class CanonicalExperimentRunner:
    """Canonical scientific execution engine for ALGOFORGE research experiments."""

    def __init__(self, db_path: Optional[str] = None):
        self.memory = AlgorithmicMemory(db_path=db_path) if db_path else AlgorithmicMemory()
        self.extractor = StrategyExtractor()
        self.retriever = KnowledgeRetriever(self.memory)

    def run_experiment(
        self,
        problem_id: str,
        method: str = "memory_augmented", # memoryless_baseline or memory_augmented
        seeds: List[int] = None,
        population_size: int = 40,
        generation_limit: int = 30,
        mutation_rate: float = 0.25,
        crossover_rate: float = 0.7,
        max_ast_depth: int = 6,
        exp_id_prefix: str = "ALGOFORGE-EXP"
    ) -> Dict[str, Any]:

        if seeds is None:
            seeds = [42, 101, 202, 303, 404] # 5 seeds for default test

        tasks = get_benchmark_tasks()
        if problem_id not in tasks:
            raise ValueError(f"Unknown problem_id: {problem_id}")

        test_cases = tasks[problem_id]
        spec = BENCHMARK_SPECS.get(problem_id, {})
        solution_thresh = spec.get("threshold", 100.0)

        # Retrieve prior strategies if memory-augmented
        retrieved_strats = []
        if method == "memory_augmented":
            retrieved_strats = self.retriever.retrieve_strategies(problem_id, test_cases, top_k=3)

        artifacts: List[ExperimentArtifact] = []

        for seed in seeds:
            exp_id = f"{exp_id_prefix}-{problem_id.upper()}-{method.upper()}-S{seed}"
            start_t = time.time()

            engine = GeneticEngine(
                population_size=population_size,
                generations=generation_limit,
                mutation_rate=mutation_rate,
                crossover_rate=crossover_rate,
                max_depth=max_ast_depth,
                target_fitness=solution_thresh - 5.0,
                seed=seed
            )

            eval_counter = [0]
            solution_evals = [0]
            first_sol_found = [False]

            def eval_cb(gen, best_fit, avg_fit, best_prog):
                # Count evaluations
                eval_counter[0] += population_size
                is_val, _ = check_valid_solution(problem_id, best_prog, best_fit)
                if is_val and not first_sol_found[0]:
                    first_sol_found[0] = True
                    solution_evals[0] = eval_counter[0]

            res: EvolutionResult = engine.evolve(test_cases, callback=eval_cb)
            elapsed = time.time() - start_t

            is_valid, v_msg = check_valid_solution(problem_id, res.best_program, res.best_fitness)

            if is_valid:
                r_status = RunStatus.SUCCESS.value
                final_evals = solution_evals[0] if solution_evals[0] > 0 else (res.total_generations * population_size)
            elif res.total_generations >= generation_limit:
                r_status = RunStatus.TIMEOUT.value
                final_evals = res.total_generations * population_size
            else:
                r_status = RunStatus.FAILED.value
                final_evals = res.total_generations * population_size

            # If successful and memory_augmented, extract strategy & save to memory
            strat_id_used = None
            if retrieved_strats:
                strat_id_used = retrieved_strats[0]["strategy"].strategy_id

            if r_status == RunStatus.SUCCESS.value:
                new_strat = self.extractor.extract_strategy(
                    program=res.best_program,
                    problem_id=problem_id,
                    problem_family=spec.get("set", "general"),
                    fitness=res.best_fitness,
                    verification_status="EXHAUSTIVE" if len(test_cases[0][0]) <= 4 else "FINITE_TEST_SUITE",
                    generation=res.total_generations
                )
                try:
                    self.memory.save_strategy(new_strat)
                except Exception as ex:
                    # Ignore if memory is frozen during held-out evaluation
                    pass

                if strat_id_used:
                    self.memory.update_transfer_stats(strat_id_used, success=True)

            elif strat_id_used:
                self.memory.update_transfer_stats(strat_id_used, success=False)

            art = ExperimentArtifact(
                experiment_id=exp_id,
                version="2.0.0",
                problem_id=problem_id,
                method=method,
                seed=seed,
                population_size=population_size,
                generation_limit=generation_limit,
                mutation_rate=mutation_rate,
                crossover_rate=crossover_rate,
                max_ast_depth=max_ast_depth,
                evaluations_to_solution=final_evals,
                best_fitness=res.best_fitness,
                solution_threshold=solution_thresh,
                run_status=r_status,
                verified=is_valid,
                verification_method="EXHAUSTIVE" if len(test_cases[0][0]) <= 4 else "FINITE_TEST_SUITE",
                strategy_used=strat_id_used,
                runtime_seconds=round(elapsed, 3),
                timestamp=time.time(),
                hardware_metadata={"python_version": platform.python_version(), "os": platform.system()}
            )

            # Save metadata to SQLite
            self.memory.save_experiment_artifact(art)

            # Save immutable JSON artifact to experiments/ directory on filesystem
            exp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'experiments'))
            os.makedirs(exp_dir, exist_ok=True)
            exp_json_path = os.path.join(exp_dir, f"{exp_id}.json")
            with open(exp_json_path, 'w', encoding='utf-8') as f:
                json.dump(art.to_dict(), f, indent=2)

            artifacts.append(art)

        metrics = ResearchMetricsEngine.calculate_experiment_metrics(artifacts)
        return {
            "problem_id": problem_id,
            "method": method,
            "seeds_tested": len(seeds),
            "retrieved_strategies_count": len(retrieved_strats),
            "metrics": metrics,
            "artifacts": [a.to_dict() for a in artifacts]
        }

    def reproduce_experiment(self, experiment_id: str) -> Dict[str, Any]:
        art = self.memory.get_experiment_artifact(experiment_id)
        if not art:
            raise ValueError(f"Experiment artifact '{experiment_id}' not found in memory.")

        # Re-run single experiment with exact seed and config
        res = self.run_experiment(
            problem_id=art.problem_id,
            method=art.method,
            seeds=[art.seed],
            population_size=art.population_size,
            generation_limit=art.generation_limit,
            mutation_rate=art.mutation_rate,
            crossover_rate=art.crossover_rate,
            max_ast_depth=art.max_ast_depth,
            exp_id_prefix="REPRODUCE"
        )
        reproduced_art = res["artifacts"][0]
        match_evals = reproduced_art["evaluations_to_solution"] == art.evaluations_to_solution
        match_fit   = abs(reproduced_art["best_fitness"] - art.best_fitness) < 1e-4

        return {
            "original_artifact": art.to_dict(),
            "reproduced_artifact": reproduced_art,
            "deterministic_match": match_evals and match_fit,
            "evaluations_matched": match_evals,
            "fitness_matched": match_fit
        }
