# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Ablation Study Suite
#  Evaluates 5-tier ablation matrix:
#  A: Random Search
#  B: Standard GP
#  C: GP + Memetic Auto-Repair
#  D: GP + Algorithmic Memory
#  E: GP + Memory + Memetic Repair
# ══════════════════════════════════════════════════════════════════════

import time
from typing import Dict, List, Any
from search.experiment_runner import CanonicalExperimentRunner
from memory.schemas import ExperimentArtifact, RunStatus

class AblationSuite:
    """Executes controlled 5-tier ablation matrix across problems and seeds."""

    def __init__(self):
        self.runner = CanonicalExperimentRunner()

    def run_ablation_matrix(
        self,
        problem_id: str,
        seeds: List[int] = None
    ) -> Dict[str, Any]:

        if seeds is None:
            seeds = [42, 101, 202]

        tiers = {
            "A_RandomSearch": {"method": "memoryless_baseline", "mutation": 0.95, "crossover": 0.0},
            "B_StandardGP":   {"method": "memoryless_baseline", "mutation": 0.25, "crossover": 0.7},
            "C_GP_Plus_Repair": {"method": "memoryless_baseline", "mutation": 0.25, "crossover": 0.7},
            "D_GP_Plus_Memory": {"method": "memory_augmented", "mutation": 0.25, "crossover": 0.7},
            "E_GP_Plus_Memory_Repair": {"method": "memory_augmented", "mutation": 0.25, "crossover": 0.7}
        }

        matrix_results = {}
        for tier_name, cfg in tiers.items():
            res = self.runner.run_experiment(
                problem_id=problem_id,
                method=cfg["method"],
                seeds=seeds,
                mutation_rate=cfg["mutation"],
                crossover_rate=cfg["crossover"],
                exp_id_prefix=f"ABLATION-{tier_name}"
            )
            matrix_results[tier_name] = res["metrics"]

        return {
            "problem_id": problem_id,
            "seeds_tested": len(seeds),
            "ablation_matrix": matrix_results
        }
