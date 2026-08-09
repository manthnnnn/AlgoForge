import unittest
import tempfile
import os
from memory.schemas import AlgorithmicStrategy
from memory.algorithmic_memory import AlgorithmicMemory
from memory.knowledge_retriever import KnowledgeRetriever

class TestKnowledgeRetriever(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "retriever_test.db")
        self.memory = AlgorithmicMemory(db_path=self.db_path)
        self.retriever = KnowledgeRetriever(self.memory)

    def tearDown(self):
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def test_retrieve_strategies_with_reasoning(self):
        strat = AlgorithmicStrategy(
            strategy_id="STRAT-SORT-01",
            source_algorithm_id="ALGO-01",
            source_problem_id="sort_2",
            problem_family="sorting",
            strategy_class="PAIRWISE_SWAP_NETWORK",
            ast_signature="SIG01",
            canonical_ast_repr="CompareSwap(0, 1)",
            structural_features={"depth": 3, "has_swaps": True, "has_loops": False},
            primitive_distribution={"CompareSwapNode": 2},
            complexity_estimate="O(1)",
            fitness=100.0,
            verification_status="EXHAUSTIVE",
            discovery_generation=1
        )
        self.memory.save_strategy(strat)

        test_cases = [([3, 2, 1], [1, 2, 3])]
        retrieved = self.retriever.retrieve_strategies("sort_3", test_cases, top_k=1)

        self.assertEqual(len(retrieved), 1)
        res = retrieved[0]
        self.assertEqual(res["strategy"].strategy_id, "STRAT-SORT-01")
        self.assertIn("reasoning", res)
        self.assertGreater(res["similarity_score"], 0.5)

if __name__ == "__main__":
    unittest.main()
