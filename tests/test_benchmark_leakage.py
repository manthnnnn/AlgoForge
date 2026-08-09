# ══════════════════════════════════════════════════════════════════════
#  GATE 2 TEST — Benchmark Non-Leakage Isolation
#  Proves strict separation between Training Benchmarks and Held-Out
#  Test Benchmarks so held-out problems are never used for memory construction.
# ══════════════════════════════════════════════════════════════════════

import unittest
from benchmarks.suite import BENCHMARK_SPECS, get_training_tasks, get_held_out_tasks

class TestBenchmarkLeakage(unittest.TestCase):
    def test_strict_set_disjointness(self):
        training = set(get_training_tasks())
        held_out = set(get_held_out_tasks())

        self.assertGreater(len(training), 0, "Training benchmark set cannot be empty.")
        self.assertGreater(len(held_out), 0, "Held-out benchmark set cannot be empty.")

        # Zero intersection constraint
        intersection = training.intersection(held_out)
        self.assertEqual(len(intersection), 0, f"Benchmark set leakage detected! Common tasks: {intersection}")

    def test_benchmark_solution_thresholds(self):
        for task_name, spec in BENCHMARK_SPECS.items():
            self.assertIn("threshold", spec, f"Task {task_name} missing solution threshold.")
            self.assertIn("validator", spec, f"Task {task_name} missing validator function.")
            self.assertIn("max_depth", spec, f"Task {task_name} missing max AST depth.")
            
            # Exact tasks must require 100% threshold
            if spec["set"] in ["training", "held_out"]:
                self.assertEqual(spec["threshold"], 100.0, f"Task {task_name} must require 100.0% threshold.")

if __name__ == "__main__":
    unittest.main()
