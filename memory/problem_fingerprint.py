# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Problem Fingerprint Encoder Module
#  Local interpretable problem feature encoder without external APIs.
# ══════════════════════════════════════════════════════════════════════

from typing import List, Dict, Any, Tuple
from memory.schemas import ProblemFingerprint

class ProblemFingerprintEncoder:
    """Extracts interpretable problem feature vector without external APIs."""

    def encode(self, problem_id: str, test_cases: List[Tuple[Any, Any]], meta: Dict[str, Any] = None) -> ProblemFingerprint:
        meta = meta or {}

        sample_in = test_cases[0][0] if test_cases else []
        dim = len(sample_in) if isinstance(sample_in, list) else 1

        problem_family = meta.get("family", self._infer_family(problem_id))
        primitives = meta.get("primitives", ["CompareSwapNode", "SwapNode", "ConstNode"])

        return ProblemFingerprint(
            problem_id=problem_id,
            problem_family=problem_family,
            input_type="List[int]",
            output_type="List[int]",
            dimensionality=dim,
            constraint_count=len(test_cases),
            objective_type="PermutationSort" if "sort" in problem_id else "ArrayTransform",
            primitives_used=primitives,
            has_comparison="sort" in problem_id or "min" in problem_id or "max" in problem_id,
            has_iteration=dim > 4,
            has_recursion=False,
            has_branching="partition" in problem_id or "wavelet" in problem_id
        )

    def _infer_family(self, problem_id: str) -> str:
        if "sort" in problem_id: return "sorting"
        if "partition" in problem_id: return "partitioning"
        if "compress" in problem_id: return "compression"
        if "wavelet" in problem_id: return "transform"
        if "graph" in problem_id or "bfs" in problem_id or "dfs" in problem_id: return "graph"
        return "array_manipulation"
