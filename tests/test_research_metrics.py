import unittest
from memory.schemas import ExperimentArtifact, RunStatus
from search.research_metrics import ResearchMetricsEngine

class TestResearchMetrics(unittest.TestCase):
    def test_calculate_metrics_and_search_reduction(self):
        art1 = ExperimentArtifact(
            experiment_id="EXP-1", version="2.0", problem_id="sort_3", method="memoryless_baseline",
            seed=42, population_size=40, generation_limit=25, mutation_rate=0.25, crossover_rate=0.7,
            max_ast_depth=6, evaluations_to_solution=1000, best_fitness=100.0, solution_threshold=100.0,
            run_status=RunStatus.SUCCESS.value, verified=True, verification_method="EXHAUSTIVE"
        )
        art2 = ExperimentArtifact(
            experiment_id="EXP-2", version="2.0", problem_id="sort_3", method="memory_augmented",
            seed=42, population_size=40, generation_limit=25, mutation_rate=0.25, crossover_rate=0.7,
            max_ast_depth=6, evaluations_to_solution=400, best_fitness=100.0, solution_threshold=100.0,
            run_status=RunStatus.SUCCESS.value, verified=True, verification_method="EXHAUSTIVE"
        )

        base_metrics = ResearchMetricsEngine.calculate_experiment_metrics([art1])
        self.assertEqual(base_metrics["success_rate"], 100.0)
        self.assertEqual(base_metrics["mean_evaluations_success"], 1000.0)

        paired = ResearchMetricsEngine.calculate_paired_search_reduction([art1], [art2])
        self.assertEqual(paired["paired_success_runs"], 1)
        self.assertEqual(paired["mean_search_cost_reduction_pct"], 60.0)
        self.assertEqual(paired["positive_transfers"], 1)

if __name__ == "__main__":
    unittest.main()
