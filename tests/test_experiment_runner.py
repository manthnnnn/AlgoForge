import unittest
import tempfile
import os
from search.experiment_runner import CanonicalExperimentRunner
from memory.schemas import RunStatus

class TestExperimentRunner(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "exp_test_memory.db")
        self.runner = CanonicalExperimentRunner(db_path=self.db_path)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_run_experiment_and_reproduce(self):
        res = self.runner.run_experiment(
            problem_id="sort_2",
            method="memoryless_baseline",
            seeds=[42],
            population_size=10,
            generation_limit=5
        )
        self.assertEqual(res["problem_id"], "sort_2")
        self.assertEqual(len(res["artifacts"]), 1)
        art = res["artifacts"][0]
        self.assertIn(art["run_status"], [RunStatus.SUCCESS.value, RunStatus.TIMEOUT.value, RunStatus.FAILED.value])

        # Reproduce
        exp_id = art["experiment_id"]
        repro = self.runner.reproduce_experiment(exp_id)
        self.assertTrue(repro["deterministic_match"])
        self.assertTrue(repro["evaluations_matched"])

if __name__ == "__main__":
    unittest.main()
