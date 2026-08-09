import unittest
from dsl.ast_nodes import ProgramNode, CompareSwapNode, ConstNode
from memory.strategy_extractor import StrategyExtractor

class TestStrategyExtractor(unittest.TestCase):
    def test_extract_strategy(self):
        extractor = StrategyExtractor()
        prog = ProgramNode(statements=[
            CompareSwapNode(ConstNode(0), ConstNode(1)),
            CompareSwapNode(ConstNode(1), ConstNode(2)),
            CompareSwapNode(ConstNode(0), ConstNode(1))
        ])

        strat = extractor.extract_strategy(
            program=prog,
            problem_id="sort_3",
            problem_family="sorting",
            fitness=100.0,
            verification_status="EXHAUSTIVE",
            generation=5
        )

        self.assertIsNotNone(strat.strategy_id)
        self.assertEqual(strat.strategy_class, "PAIRWISE_SWAP_NETWORK")
        self.assertEqual(strat.fitness, 100.0)
        self.assertIn("CompareSwapNode", strat.primitive_distribution)

if __name__ == "__main__":
    unittest.main()
