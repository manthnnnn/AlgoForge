# ══════════════════════════════════════════════════════════════════════
#  GATE 3 TEST — Memory Leakage & Freeze Verification
#  Proves that frozen Algorithmic Memory strictly REJECTS strategy writes
#  during held-out evaluation to prevent strategy leakage.
# ══════════════════════════════════════════════════════════════════════

import unittest
import tempfile
import os

from memory.schemas import AlgorithmicStrategy
from memory.algorithmic_memory import AlgorithmicMemory, MemoryFrozenException

class TestMemoryLeakage(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "freeze_test.db")
        self.memory = AlgorithmicMemory(db_path=self.db_path)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_frozen_memory_rejects_strategy_write(self):
        # 1. Unfrozen state allows saving strategy
        strat1 = AlgorithmicStrategy(
            strategy_id="STRAT-TRAIN-01",
            source_algorithm_id="ALGO-01",
            source_problem_id="sort_2",
            problem_family="sorting",
            strategy_class="PAIRWISE_SWAP_NETWORK",
            ast_signature="SIG123",
            canonical_ast_repr="CompareSwap(0, 1)",
            structural_features={},
            primitive_distribution={},
            complexity_estimate="O(1)",
            fitness=100.0,
            verification_status="EXHAUSTIVE",
            discovery_generation=2
        )
        self.memory.save_strategy(strat1)
        self.assertEqual(len(self.memory.get_all_strategies()), 1)

        # 2. Freeze Memory prior to held-out evaluation
        self.memory.freeze_memory()
        self.assertTrue(self.memory.is_frozen)

        # 3. Attempt strategy write while frozen MUST be REJECTED
        strat_held_out = AlgorithmicStrategy(
            strategy_id="STRAT-HELDOUT-LEAK",
            source_algorithm_id="ALGO-LEAK",
            source_problem_id="zigzag_sort_4",
            problem_family="sorting",
            strategy_class="LOCAL_SEARCH",
            ast_signature="LEAKSIG",
            canonical_ast_repr="ReverseRange(0, 3)",
            structural_features={},
            primitive_distribution={},
            complexity_estimate="O(N)",
            fitness=100.0,
            verification_status="EXHAUSTIVE",
            discovery_generation=5
        )

        with self.assertRaises(MemoryFrozenException):
            self.memory.save_strategy(strat_held_out)

        # 4. Verify strategy count remains unchanged (no leakage)
        strats_after = self.memory.get_all_strategies()
        self.assertEqual(len(strats_after), 1)
        self.assertEqual(strats_after[0].strategy_id, "STRAT-TRAIN-01")

        # 5. Unfreeze allows writes again
        self.memory.unfreeze_memory()
        self.assertFalse(self.memory.is_frozen)

if __name__ == "__main__":
    unittest.main()
