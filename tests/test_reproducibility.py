import unittest
import tempfile
import os
from search.experiment_runner import CanonicalExperimentRunner

class TestReproducibility(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "repro_test.db")
        self.runner = CanonicalExperimentRunner(db_path=self.db_path)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_reproduce_experiment_deterministic_metrics(self):
        res = self.runner.run_experiment(
            problem_id="sort_2",
            method="memoryless_baseline",
            seeds=[42],
            population_size=10,
            generation_limit=5
        )
        art = res["artifacts"][0]
        exp_id = art["experiment_id"]

        repro = self.runner.reproduce_experiment(exp_id)
        self.assertTrue(repro["deterministic_match"])
        self.assertTrue(repro["evaluations_matched"])
        self.assertTrue(repro["fitness_matched"])

        orig = repro["original_artifact"]
        rep  = repro["reproduced_artifact"]

        self.assertEqual(orig["seed"], rep["seed"])
        self.assertEqual(orig["problem_id"], rep["problem_id"])
        self.assertEqual(orig["evaluations_to_solution"], rep["evaluations_to_solution"])
        self.assertEqual(orig["best_fitness"], rep["best_fitness"])
        self.assertEqual(orig["verification_method"], rep["verification_method"])

if __name__ == "__main__":
    unittest.main()
