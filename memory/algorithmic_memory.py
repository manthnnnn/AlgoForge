# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Persistent Algorithmic Memory Engine
#  SQLite-backed persistent knowledge base storing extracted strategies,
#  structural AST signatures, transfer success rates, and artifacts.
# ══════════════════════════════════════════════════════════════════════

import sqlite3
import json
import os
import time
from typing import List, Dict, Any, Optional

from memory.schemas import AlgorithmicStrategy, ProblemFingerprint, ExperimentArtifact, TransferRecord

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'algorithmic_memory.db'))

class MemoryFrozenException(Exception):
    """Raised when an attempt is made to save a strategy while Algorithmic Memory is frozen."""
    pass

class AlgorithmicMemory:
    """Persistent SQLite knowledge base for ALGOFORGE algorithmic memory."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.is_frozen = False
        self._init_db()

    def freeze_memory(self):
        """Freezes Algorithmic Memory to prevent test-set strategy leakage during held-out evaluation."""
        self.is_frozen = True

    def unfreeze_memory(self):
        """Unfreezes Algorithmic Memory to allow strategy persistence during training."""
        self.is_frozen = False

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cur = conn.cursor()
            # Strategies Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS strategies (
                    strategy_id TEXT PRIMARY KEY,
                    source_algorithm_id TEXT,
                    source_problem_id TEXT,
                    problem_family TEXT,
                    strategy_class TEXT,
                    ast_signature TEXT,
                    canonical_ast_repr TEXT,
                    structural_features TEXT,
                    primitive_distribution TEXT,
                    complexity_estimate TEXT,
                    fitness REAL,
                    verification_status TEXT,
                    discovery_generation INTEGER,
                    transfer_attempts INTEGER DEFAULT 0,
                    successful_transfers INTEGER DEFAULT 0,
                    failed_transfers INTEGER DEFAULT 0,
                    creation_timestamp REAL
                )
            """)
            # Problem Fingerprints Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS problem_fingerprints (
                    problem_id TEXT PRIMARY KEY,
                    problem_family TEXT,
                    input_type TEXT,
                    output_type TEXT,
                    dimensionality INTEGER,
                    constraint_count INTEGER,
                    objective_type TEXT,
                    primitives_used TEXT,
                    has_comparison INTEGER,
                    has_iteration INTEGER,
                    has_recursion INTEGER,
                    has_branching INTEGER
                )
            """)
            # Transfer Records Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS transfer_records (
                    transfer_id TEXT PRIMARY KEY,
                    strategy_id TEXT,
                    source_problem_id TEXT,
                    target_problem_id TEXT,
                    similarity_score REAL,
                    baseline_evaluations INTEGER,
                    memory_guided_evaluations INTEGER,
                    search_cost_reduction REAL,
                    transfer_result TEXT,
                    failure_reason TEXT,
                    timestamp REAL
                )
            """)
            # Experiment Artifacts Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS experiment_artifacts (
                    experiment_id TEXT PRIMARY KEY,
                    version TEXT,
                    problem_id TEXT,
                    method TEXT,
                    seed INTEGER,
                    population_size INTEGER,
                    generation_limit INTEGER,
                    mutation_rate REAL,
                    crossover_rate REAL,
                    max_ast_depth INTEGER,
                    evaluations_to_solution INTEGER,
                    best_fitness REAL,
                    solution_threshold REAL,
                    run_status TEXT,
                    verified INTEGER,
                    verification_method TEXT,
                    strategy_used TEXT,
                    runtime_seconds REAL,
                    timestamp REAL,
                    artifact_json TEXT
                )
            """)
            conn.commit()

    # ──────────── Strategies ────────────
    def save_strategy(self, strategy: AlgorithmicStrategy):
        if self.is_frozen:
            raise MemoryFrozenException("Memory is frozen. Strategy write rejected during held-out evaluation.")

        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT OR REPLACE INTO strategies (
                    strategy_id, source_algorithm_id, source_problem_id, problem_family,
                    strategy_class, ast_signature, canonical_ast_repr, structural_features,
                    primitive_distribution, complexity_estimate, fitness, verification_status,
                    discovery_generation, transfer_attempts, successful_transfers, failed_transfers,
                    creation_timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                strategy.strategy_id, strategy.source_algorithm_id, strategy.source_problem_id,
                strategy.problem_family, strategy.strategy_class, strategy.ast_signature,
                strategy.canonical_ast_repr, json.dumps(strategy.structural_features),
                json.dumps(strategy.primitive_distribution), strategy.complexity_estimate,
                strategy.fitness, strategy.verification_status, strategy.discovery_generation,
                strategy.transfer_attempts, strategy.successful_transfers, strategy.failed_transfers,
                strategy.creation_timestamp or time.time()
            ))
            conn.commit()

    # ──────────── Strategies ────────────
    def get_all_strategies(self) -> List[AlgorithmicStrategy]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM strategies")
            rows = cur.fetchall()
            strategies = []
            for r in rows:
                strategies.append(AlgorithmicStrategy(
                    strategy_id=r['strategy_id'],
                    source_algorithm_id=r['source_algorithm_id'],
                    source_problem_id=r['source_problem_id'],
                    problem_family=r['problem_family'],
                    strategy_class=r['strategy_class'],
                    ast_signature=r['ast_signature'],
                    canonical_ast_repr=r['canonical_ast_repr'],
                    structural_features=json.loads(r['structural_features'] or '{}'),
                    primitive_distribution=json.loads(r['primitive_distribution'] or '{}'),
                    complexity_estimate=r['complexity_estimate'],
                    fitness=r['fitness'],
                    verification_status=r['verification_status'],
                    discovery_generation=r['discovery_generation'],
                    transfer_attempts=r['transfer_attempts'],
                    successful_transfers=r['successful_transfers'],
                    failed_transfers=r['failed_transfers'],
                    creation_timestamp=r['creation_timestamp']
                ))
            return strategies

    def update_transfer_stats(self, strategy_id: str, success: bool):
        with self._get_conn() as conn:
            cur = conn.cursor()
            if success:
                cur.execute("""
                    UPDATE strategies 
                    SET transfer_attempts = transfer_attempts + 1, successful_transfers = successful_transfers + 1
                    WHERE strategy_id = ?
                """, (strategy_id,))
            else:
                cur.execute("""
                    UPDATE strategies 
                    SET transfer_attempts = transfer_attempts + 1, failed_transfers = failed_transfers + 1
                    WHERE strategy_id = ?
                """, (strategy_id,))
            conn.commit()

    # ──────────── Problem Fingerprints ────────────
    def save_problem_fingerprint(self, fp: ProblemFingerprint):
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT OR REPLACE INTO problem_fingerprints (
                    problem_id, problem_family, input_type, output_type, dimensionality,
                    constraint_count, objective_type, primitives_used, has_comparison,
                    has_iteration, has_recursion, has_branching
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fp.problem_id, fp.problem_family, fp.input_type, fp.output_type,
                fp.dimensionality, fp.constraint_count, fp.objective_type,
                json.dumps(fp.primitives_used), int(fp.has_comparison),
                int(fp.has_iteration), int(fp.has_recursion), int(fp.has_branching)
            ))
            conn.commit()

    def get_problem_fingerprint(self, problem_id: str) -> Optional[ProblemFingerprint]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM problem_fingerprints WHERE problem_id = ?", (problem_id,))
            r = cur.fetchone()
            if not r: return None
            return ProblemFingerprint(
                problem_id=r['problem_id'],
                problem_family=r['problem_family'],
                input_type=r['input_type'],
                output_type=r['output_type'],
                dimensionality=r['dimensionality'],
                constraint_count=r['constraint_count'],
                objective_type=r['objective_type'],
                primitives_used=json.loads(r['primitives_used'] or '[]'),
                has_comparison=bool(r['has_comparison']),
                has_iteration=bool(r['has_iteration']),
                has_recursion=bool(r['has_recursion']),
                has_branching=bool(r['has_branching'])
            )

    # ──────────── Transfer Records ────────────
    def record_transfer(self, rec: TransferRecord):
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT OR REPLACE INTO transfer_records (
                    transfer_id, strategy_id, source_problem_id, target_problem_id,
                    similarity_score, baseline_evaluations, memory_guided_evaluations,
                    search_cost_reduction, transfer_result, failure_reason, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rec.transfer_id, rec.strategy_id, rec.source_problem_id, rec.target_problem_id,
                rec.similarity_score, rec.baseline_evaluations, rec.memory_guided_evaluations,
                rec.search_cost_reduction, rec.transfer_result, rec.failure_reason, time.time()
            ))
            conn.commit()

    def get_transfer_records(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM transfer_records ORDER BY timestamp DESC")
            return [dict(r) for r in cur.fetchall()]

    # ──────────── Experiment Artifacts ────────────
    def save_experiment_artifact(self, artifact: ExperimentArtifact):
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT OR REPLACE INTO experiment_artifacts (
                    experiment_id, version, problem_id, method, seed, population_size,
                    generation_limit, mutation_rate, crossover_rate, max_ast_depth,
                    evaluations_to_solution, best_fitness, solution_threshold, run_status,
                    verified, verification_method, strategy_used, runtime_seconds,
                    timestamp, artifact_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                artifact.experiment_id, artifact.version, artifact.problem_id, artifact.method,
                artifact.seed, artifact.population_size, artifact.generation_limit,
                artifact.mutation_rate, artifact.crossover_rate, artifact.max_ast_depth,
                artifact.evaluations_to_solution, artifact.best_fitness, artifact.solution_threshold,
                artifact.run_status, int(artifact.verified), artifact.verification_method,
                artifact.strategy_used, artifact.runtime_seconds, artifact.timestamp or time.time(),
                json.dumps(artifact.to_dict())
            ))
            conn.commit()

    def get_experiment_artifact(self, exp_id: str) -> Optional[ExperimentArtifact]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT artifact_json FROM experiment_artifacts WHERE experiment_id = ?", (exp_id,))
            r = cur.fetchone()
            if not r or not r['artifact_json']: return None
            return ExperimentArtifact.from_dict(json.loads(r['artifact_json']))

    def get_all_experiment_artifacts(self) -> List[ExperimentArtifact]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT artifact_json FROM experiment_artifacts ORDER BY timestamp DESC")
            rows = cur.fetchall()
            arts = []
            for r in rows:
                if r['artifact_json']:
                    arts.append(ExperimentArtifact.from_dict(json.loads(r['artifact_json'])))
            return arts
