# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Strategy Extractor Engine
#  Post-discovery AST topology analyzer that abstracts problem-specific
#  literals and indices into reusable structural strategies.
# ══════════════════════════════════════════════════════════════════════

import hashlib
import time
from typing import Dict, Any, List, Tuple
from dsl.ast_nodes import ProgramNode, ASTNode
from memory.schemas import AlgorithmicStrategy, StrategyClass

class StrategyExtractor:
    """Analyzes AST topology, extracts subtree patterns, and abstracts literals into strategies."""

    def extract_strategy(
        self,
        program: ProgramNode,
        problem_id: str,
        problem_family: str,
        fitness: float,
        verification_status: str,
        generation: int
    ) -> AlgorithmicStrategy:

        repr_str = str(program)
        ast_sig  = hashlib.md5(repr_str.encode()).hexdigest()[:12].upper()
        strat_id = f"STRAT-{problem_family.upper()[:4]}-{ast_sig[:6]}"

        primitive_dist = self._count_primitives(program)
        structural_features = self._analyze_structure(program)
        strat_class = self._classify_strategy(program, structural_features, primitive_dist)
        complexity_est = self._estimate_complexity(program, structural_features)
        canonical_repr = self._canonicalize_ast(program)

        return AlgorithmicStrategy(
            strategy_id=strat_id,
            source_algorithm_id=f"ALGO-{ast_sig[:6]}",
            source_problem_id=problem_id,
            problem_family=problem_family,
            strategy_class=strat_class,
            ast_signature=ast_sig,
            canonical_ast_repr=canonical_repr,
            structural_features=structural_features,
            primitive_distribution=primitive_dist,
            complexity_estimate=complexity_est,
            fitness=fitness,
            verification_status=verification_status,
            discovery_generation=generation,
            creation_timestamp=time.time()
        )

    def _count_primitives(self, node: ASTNode) -> Dict[str, int]:
        counts = {}
        if not node: return counts

        t = node.__class__.__name__
        counts[t] = counts.get(t, 0) + 1

        if hasattr(node, 'statements') and node.statements:
            for s in node.statements:
                for k, v in self._count_primitives(s).items():
                    counts[k] = counts.get(k, 0) + v
        elif hasattr(node, 'then_body') or hasattr(node, 'body'):
            body = getattr(node, 'then_body', None) or getattr(node, 'body', None) or []
            for s in body:
                for k, v in self._count_primitives(s).items():
                    counts[k] = counts.get(k, 0) + v
            else_body = getattr(node, 'else_body', None) or []
            for s in else_body:
                for k, v in self._count_primitives(s).items():
                    counts[k] = counts.get(k, 0) + v
        else:
            for child_attr in ['left', 'right', 'idx1', 'idx2', 'start', 'end', 'idx', 'value', 'condition']:
                child = getattr(node, child_attr, None)
                if isinstance(child, ASTNode):
                    for k, v in self._count_primitives(child).items():
                        counts[k] = counts.get(k, 0) + v
        return counts

    def _analyze_structure(self, program: ProgramNode) -> Dict[str, Any]:
        depth = program.get_depth() if hasattr(program, 'get_depth') else 1
        stmt_count = len(program.statements) if hasattr(program, 'statements') else 1

        has_loops = any(n.__class__.__name__ == 'LoopNode' for n in self._walk(program))
        has_ifs   = any(n.__class__.__name__ == 'IfNode' for n in self._walk(program))
        has_swaps = any(n.__class__.__name__ in ['SwapNode', 'CompareSwapNode'] for n in self._walk(program))

        swap_pairs = []
        for n in self._walk(program):
            if n.__class__.__name__ in ['CompareSwapNode', 'SwapNode']:
                i1 = getattr(n.idx1, 'value', None) if hasattr(n, 'idx1') else None
                i2 = getattr(n.idx2, 'value', None) if hasattr(n, 'idx2') else None
                if i1 is not None and i2 is not None:
                    swap_pairs.append((i1, i2))

        return {
            "depth": depth,
            "statement_count": stmt_count,
            "has_loops": has_loops,
            "has_conditionals": has_ifs,
            "has_swaps": has_swaps,
            "swap_pair_count": len(swap_pairs),
            "swap_pairs": swap_pairs
        }

    def _classify_strategy(self, program: ProgramNode, struct: Dict[str, Any], primitives: Dict[str, int]) -> str:
        if primitives.get('CompareSwapNode', 0) >= 3 and not struct['has_loops']:
            return StrategyClass.PAIRWISE_SWAP_NETWORK.value
        if struct['has_loops'] and struct['has_conditionals']:
            return StrategyClass.PARTITION_AND_COMBINE.value
        if struct['has_loops']:
            return StrategyClass.ITERATIVE_REFINEMENT.value
        if primitives.get('ReverseRangeNode', 0) > 0:
            return StrategyClass.LOCAL_SEARCH.value
        if primitives.get('CompareSwapNode', 0) > 0:
            return StrategyClass.GREEDY_SELECTION.value
        return StrategyClass.DIVIDE_AND_CONQUER.value

    def _estimate_complexity(self, program: ProgramNode, struct: Dict[str, Any]) -> str:
        if struct['has_loops']:
            loop_count = sum(1 for n in self._walk(program) if n.__class__.__name__ == 'LoopNode')
            if loop_count >= 2: return "O(N²)"
            return "O(N)"
        if struct['statement_count'] <= 6: return "O(1)"
        return "O(N log N)"

    def _canonicalize_ast(self, program: ProgramNode) -> str:
        """Abstracts specific constants while maintaining structural topology."""
        raw = str(program)
        # Simplify AST string representation for pattern matching
        lines = []
        for line in raw.splitlines():
            line_str = line.strip()
            if line_str: lines.append(line_str)
        return " | ".join(lines)

    def _walk(self, node: ASTNode) -> List[ASTNode]:
        nodes = []
        if not node: return nodes
        nodes.append(node)

        if hasattr(node, 'statements') and node.statements:
            for s in node.statements: nodes.extend(self._walk(s))
        elif hasattr(node, 'then_body') or hasattr(node, 'body'):
            body = getattr(node, 'then_body', None) or getattr(node, 'body', None) or []
            for s in body: nodes.extend(self._walk(s))
            for s in (getattr(node, 'else_body', None) or []): nodes.extend(self._walk(s))
        else:
            for child_attr in ['left', 'right', 'idx1', 'idx2', 'start', 'end', 'idx', 'value', 'condition']:
                child = getattr(node, child_attr, None)
                if isinstance(child, ASTNode): nodes.extend(self._walk(child))
        return nodes
