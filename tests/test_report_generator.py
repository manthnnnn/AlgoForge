import unittest
import tempfile
import os
from search.experiment_runner import CanonicalExperimentRunner
from search.report_generator import ResearchReportGenerator

class TestReportGenerator(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "report_test.db")
        self.runner = CanonicalExperimentRunner(db_path=self.db_path)
        self.generator = ResearchReportGenerator(db_path=self.db_path)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_report_generation_from_real_artifacts(self):
        # Empty memory gives message
        md_empty = self.generator.generate_markdown_report()
        self.assertIn("No experimental data available", md_empty)

        # Run real experiment
        self.runner.run_experiment(
            problem_id="sort_2",
            method="memoryless_baseline",
            seeds=[42],
            population_size=10,
            generation_limit=5
        )

        md = self.generator.generate_markdown_report()
        latex = self.generator.generate_latex_report()

        self.assertIn("ALGOFORGE 2.0", md)
        self.assertIn("\\documentclass{article}", latex)

if __name__ == "__main__":
    unittest.main()
