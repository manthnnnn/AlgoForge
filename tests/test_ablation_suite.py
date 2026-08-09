import unittest
import tempfile
import os
from search.ablation_suite import AblationSuite

class TestAblationSuite(unittest.TestCase):
    def test_run_ablation_matrix(self):
        suite = AblationSuite()
        res = suite.run_ablation_matrix(problem_id="sort_2", seeds=[42])

        self.assertEqual(res["problem_id"], "sort_2")
        self.assertIn("ablation_matrix", res)
        matrix = res["ablation_matrix"]
        self.assertIn("A_RandomSearch", matrix)
        self.assertIn("B_StandardGP", matrix)
        self.assertIn("C_GP_Plus_Repair", matrix)

if __name__ == "__main__":
    unittest.main()
