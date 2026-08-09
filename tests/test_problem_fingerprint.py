import unittest
from memory.problem_fingerprint import ProblemFingerprintEncoder

class TestProblemFingerprint(unittest.TestCase):
    def test_encode_fingerprint(self):
        encoder = ProblemFingerprintEncoder()
        test_cases = [([3, 1, 2], [1, 2, 3])]
        fp = encoder.encode("sort_3", test_cases)

        self.assertEqual(fp.problem_id, "sort_3")
        self.assertEqual(fp.problem_family, "sorting")
        self.assertEqual(fp.dimensionality, 3)
        self.assertTrue(fp.has_comparison)
        self.assertFalse(fp.has_iteration)

if __name__ == "__main__":
    unittest.main()
