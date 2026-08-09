# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Research Schemas & Dataclasses
#  Defines formal structures for Strategies, Fingerprints, Experiments,
#  Transfer Records, and Censored Run tracking.
# ══════════════════════════════════════════════════════════════════════

import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from enum import Enum

class RunStatus(str, Enum):
    SUCCESS = "SUCCESS"
    TIMEOUT = "TIMEOUT"
    FAILED = "FAILED"

class VerificationMethod(str, Enum):
    EXHAUSTIVE = "EXHAUSTIVE"
    ZERO_ONE_PRINCIPLE = "ZERO_ONE_PRINCIPLE"
    FINITE_TEST_SUITE = "FINITE_TEST_SUITE"
    EMPIRICAL_BENCHMARK = "EMPIRICAL_BENCHMARK"

class StrategyClass(str, Enum):
    DIVIDE_AND_CONQUER = "DIVIDE_AND_CONQUER"
    PARTITION_AND_COMBINE = "PARTITION_AND_COMBINE"
    ITERATIVE_REFINEMENT = "ITERATIVE_REFINEMENT"
    GREEDY_SELECTION = "GREEDY_SELECTION"
    LOCAL_SEARCH = "LOCAL_SEARCH"
    RECURSIVE_DECOMPOSITION = "RECURSIVE_DECOMPOSITION"
    PAIRWISE_SWAP_NETWORK = "PAIRWISE_SWAP_NETWORK"

@dataclass
class ProblemFingerprint:
    problem_id: str
    problem_family: str
    input_type: str
    output_type: str
    dimensionality: int
    constraint_count: int
    objective_type: str
    primitives_used: List[str]
    has_comparison: bool = True
    has_iteration: bool = False
    has_recursion: bool = False
    has_branching: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ProblemFingerprint':
        return cls(**data)

@dataclass
class AlgorithmicStrategy:
    strategy_id: str
    source_algorithm_id: str
    source_problem_id: str
    problem_family: str
    strategy_class: str
    ast_signature: str
    canonical_ast_repr: str
    structural_features: Dict[str, Any]
    primitive_distribution: Dict[str, int]
    complexity_estimate: str
    fitness: float
    verification_status: str
    discovery_generation: int
    transfer_attempts: int = 0
    successful_transfers: int = 0
    failed_transfers: int = 0
    creation_timestamp: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AlgorithmicStrategy':
        return cls(**data)

@dataclass
class TransferRecord:
    transfer_id: str
    strategy_id: str
    source_problem_id: str
    target_problem_id: str
    similarity_score: float
    baseline_evaluations: int
    memory_guided_evaluations: int
    search_cost_reduction: float
    transfer_result: str  # POSITIVE, NEUTRAL, NEGATIVE
    failure_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class ExperimentArtifact:
    experiment_id: str
    version: str
    problem_id: str
    method: str  # memoryless_baseline, memory_guided, ablation_A, etc.
    seed: int
    population_size: int
    generation_limit: int
    mutation_rate: float
    crossover_rate: float
    max_ast_depth: int
    evaluations_to_solution: int
    best_fitness: float
    solution_threshold: float
    run_status: str  # SUCCESS, TIMEOUT, FAILED
    verified: bool
    verification_method: str
    strategy_used: Optional[str] = None
    runtime_seconds: float = 0.0
    timestamp: float = 0.0
    hardware_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExperimentArtifact':
        return cls(**data)
