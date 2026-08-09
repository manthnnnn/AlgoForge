# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Problem Fingerprint Encoder & Knowledge Retriever
#  Local interpretable problem feature encoder and similarity ranker.
#  Provides human-readable reasoning for every strategy retrieval.
# ══════════════════════════════════════════════════════════════════════

import math
from typing import List, Dict, Any, Tuple
from memory.schemas import ProblemFingerprint, AlgorithmicStrategy
from memory.algorithmic_memory import AlgorithmicMemory

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


class KnowledgeRetriever:
    """Matches problem fingerprints against Algorithmic Memory to rank and select prior strategies."""

    def __init__(self, memory: AlgorithmicMemory):
        self.memory = memory
        self.encoder = ProblemFingerprintEncoder()

    def retrieve_strategies(
        self,
        target_problem_id: str,
        test_cases: List[Tuple[Any, Any]],
        meta: Dict[str, Any] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:

        target_fp = self.encoder.encode(target_problem_id, test_cases, meta)
        all_strategies = self.memory.get_all_strategies()

        if not all_strategies:
            return []

        ranked = []
        for strat in all_strategies:
            sim_score, reasoning = self._compute_similarity(target_fp, strat)
            ranked.append({
                "strategy": strat,
                "similarity_score": sim_score,
                "reasoning": reasoning
            })

        ranked.sort(key=lambda x: x["similarity_score"], reverse=True)
        return ranked[:top_k]

    def _compute_similarity(self, target_fp: ProblemFingerprint, strat: AlgorithmicStrategy) -> Tuple[float, Dict[str, float]]:
        # 1. Family match
        fam_sim = 1.0 if target_fp.problem_family == strat.problem_family else 0.4

        # 2. Primitive overlap
        strat_prims = set(strat.primitive_distribution.keys())
        target_prims = set(target_fp.primitives_used)
        if target_prims and strat_prims:
            overlap_sim = len(target_prims.intersection(strat_prims)) / len(target_prims.union(strat_prims))
        else:
            overlap_sim = 0.5

        # 3. Structural similarity
        struct = strat.structural_features
        struct_sim = 0.5
        if target_fp.has_comparison == struct.get('has_swaps', False): struct_sim += 0.25
        if target_fp.has_iteration == struct.get('has_loops', False): struct_sim += 0.25

        # 4. Historical success rate weight
        total_attempts = strat.transfer_attempts
        success_rate = (strat.successful_transfers / total_attempts) if total_attempts > 0 else 0.5

        total_sim = round(0.4 * fam_sim + 0.3 * overlap_sim + 0.2 * struct_sim + 0.1 * success_rate, 4)

        reasoning = {
            "family_similarity": round(fam_sim * 100, 1),
            "primitive_overlap": round(overlap_sim * 100, 1),
            "structural_similarity": round(struct_sim * 100, 1),
            "historical_transfer_success": round(success_rate * 100, 1)
        }

        return total_sim, reasoning
