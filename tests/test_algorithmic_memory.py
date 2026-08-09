import unittest
import os
import tempfile
from memory.schemas import AlgorithmicStrategy, ProblemFingerprint, ExperimentArtifact, RunStatus
from memory.algorithmic_memory import AlgorithmicMemory

class TestAlgorithmicMemory(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "test_memory.db")
        self.memory = AlgorithmicMemory(db_path=self.db_path)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_save_and_retrieve_strategy(self):
        strat = AlgorithmicStrategy(
            strategy_id="STRAT-TEST-01",
            source_algorithm_id="ALGO-01",
            source_problem_id="sort_3",
            problem_family="sorting",
            strategy_class="PAIRWISE_SWAP_NETWORK",
            ast_signature="ABC123SIG",
            canonical_ast_repr="CompareSwapNode(0, 1)",
            structural_features={"depth": 3, "has_loops": False},
            primitive_distribution={"CompareSwapNode": 3},
            complexity_estimate="O(1)",
            fitness=100.0,
            verification_status="EXHAUSTIVE",
            discovery_generation=12
        )
        self.memory.save_strategy(strat)
        strats = self.memory.get_all_strategies()
        self.assertEqual(len(strats), 1)
        self.assertEqual(strats[0].strategy_id, "STRAT-TEST-01")
        self.assertEqual(strats[0].fitness, 100.0)

    def test_save_and_retrieve_experiment_artifact(self):
        art = ExperimentArtifact(
            experiment_id="ALGOFORGE-EXP-TEST-01",
            version="2.0.0",
            problem_id="sort_3",
            method="memory_augmented",
            seed=42,
            population_size=40,
            generation_limit=25,
            mutation_rate=0.25,
            crossover_rate=0.7,
            max_ast_depth=5,
            evaluations_to_solution=120,
            best_fitness=100.0,
            solution_threshold=100.0,
            run_status=RunStatus.SUCCESS.value,
            verified=True,
            verification_method="EXHAUSTIVE"
        )
        self.memory.save_experiment_artifact(art)
        retrieved = self.memory.get_experiment_artifact("ALGOFORGE-EXP-TEST-01")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.seed, 42)
        self.assertEqual(retrieved.run_status, "SUCCESS")

if __name__ == "__main__":
    unittest.main()
