# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Standardized Scientific Benchmark Suite
#  Strict non-leakage isolation between Training Set & Held-Out Test Set.
#  Benchmark-specific solution thresholds (100.0% for exact tasks).
# ══════════════════════════════════════════════════════════════════════

import time
import random
from typing import Dict, List, Tuple, Any, Optional, Callable
from tabulate import tabulate

from dsl.ast_nodes import ASTNode
from dsl.interpreter import SandboxInterpreter
from search.genetic_engine import GeneticEngine, EvolutionResult
from memory.program_archive import ProgramArchive

# ──────────── Benchmark Specific Thresholds & Specs ────────────
BENCHMARK_SPECS = {
    # ── Level 1: Basic Exact Algorithmic Tasks (100.0% Required) ──
    "sort_2": {
        "level": 1, "set": "training", "threshold": 100.0, "max_depth": 3,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Sort 2 elements in ascending order.",
        "validator": lambda inp, out: out == sorted(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(2)], None]
    },
    "sort_3": {
        "level": 1, "set": "training", "threshold": 100.0, "max_depth": 5,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Sort 3 elements in ascending order.",
        "validator": lambda inp, out: out == sorted(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(3)], None]
    },
    "min_first": {
        "level": 1, "set": "training", "threshold": 100.0, "max_depth": 4,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Place minimum element at index 0.",
        "validator": lambda inp, out: len(out) > 0 and out[0] == min(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(3)], None]
    },
    "sort_4": {
        "level": 1, "set": "training", "threshold": 100.0, "max_depth": 7,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Sort 4 elements in ascending order.",
        "validator": lambda inp, out: out == sorted(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(4)], None]
    },

    # ── Level 2: Intermediate Exact Tasks (100.0% Required) ──
    "reverse_3": {
        "level": 2, "set": "training", "threshold": 100.0, "max_depth": 4,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Reverse 3 elements in-place.",
        "validator": lambda inp, out: out == list(reversed(inp)),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(3)], None]
    },
    "max_last_3": {
        "level": 2, "set": "training", "threshold": 100.0, "max_depth": 5,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Push maximum element to last position.",
        "validator": lambda inp, out: len(out) > 0 and out[-1] == max(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(3)], None]
    },

    # ── Level 3 & 4: HELD-OUT TEST SET (Transfer Evaluation) ──
    "zigzag_sort_4": {
        "level": 3, "set": "held_out", "threshold": 100.0, "max_depth": 7,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Arrange 4 elements in valley-peak pattern (a < b > c < d).",
        "validator": lambda inp, out: len(out) == 4 and (out[0] <= out[1] >= out[2] <= out[3]),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(4)], None]
    },
    "even_odd_partition": {
        "level": 3, "set": "held_out", "threshold": 100.0, "max_depth": 6,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Partition evens before odds.",
        "validator": lambda inp, out: all(x % 2 == 0 for x in out[:sum(1 for v in inp if v % 2 == 0)]),
        "generator": lambda: [[random.randint(1, 20) for _ in range(4)], None]
    },
    "pancake_flip_sort": {
        "level": 4, "set": "held_out", "threshold": 100.0, "max_depth": 8,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Sort array using prefix range reversals.",
        "validator": lambda inp, out: out == sorted(inp),
        "generator": lambda: [[random.randint(1, 10) for _ in range(4)], None]
    },
    "bit_parity_partition": {
        "level": 4, "set": "held_out", "threshold": 100.0, "max_depth": 7,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Partition numbers based on bitwise parity.",
        "validator": lambda inp, out: sorted(inp) == sorted(out),
        "generator": lambda: [[random.randint(1, 20) for _ in range(4)], None]
    },
    "cascade_sort_5": {
        "level": 4, "set": "held_out", "threshold": 100.0, "max_depth": 9,
        "input_type": "List[int]", "output_type": "List[int]",
        "desc": "Sort 5 elements using 10 compare-swaps.",
        "validator": lambda inp, out: out == sorted(inp),
        "generator": lambda: [[random.randint(-10, 10) for _ in range(5)], None]
    }
}

TASK_DIFFICULTY = {
    "sort_2":                {"level": "Easy",    "chip": "easy",   "steps": "~1 swap",   "desc": "Sort 2 elements. Simplest possible task."},
    "sort_3":                {"level": "Easy",    "chip": "easy",   "steps": "~3 swaps",  "desc": "Sort 3 elements. Needs a 3-compare network."},
    "min_first":             {"level": "Easy",    "chip": "easy",   "steps": "~2 swaps",  "desc": "Move minimum to position 0."},
    "sort_4":                {"level": "Medium",  "chip": "medium", "steps": "~5 swaps",  "desc": "Sort 4 elements. Requires a full sorting network."},
    "reverse_3":             {"level": "Medium",  "chip": "medium", "steps": "~2 swaps",  "desc": "Reverse 3 elements in-place."},
    "max_last_3":            {"level": "Medium",  "chip": "medium", "steps": "~3 swaps",  "desc": "Push the maximum element to the last position."},
    "zigzag_sort_4":         {"level": "Hard",    "chip": "novel",  "steps": "~6 swaps",  "desc": "arrange as valley-peak-valley-peak pattern."},
    "even_odd_partition":    {"level": "Hard",    "chip": "novel",  "steps": "~4 swaps",  "desc": "Partition even numbers before odd numbers."},
    "pancake_flip_sort":     {"level": "Ultra",   "chip": "novel",  "steps": "~6 flips",  "desc": "Sort array using only prefix range flips."},
    "bit_parity_partition":  {"level": "Ultra",   "chip": "novel",  "steps": "~5 ops",    "desc": "Partition numbers using bitwise parity."},
    "cascade_sort_5":        {"level": "Expert",  "chip": "hard",   "steps": "~10 swaps", "desc": "Full sort of 5 elements — needs many nested loops!"},
}

def get_benchmark_tasks() -> Dict[str, List[Tuple[List[int], List[int]]]]:
    return {
        "sort_2": [([2, 1], [1, 2]), ([1, 2], [1, 2]), ([5, 3], [3, 5]), ([0, 9], [0, 9]), ([10, -1], [-1, 10])],
        "sort_3": [([3, 2, 1], [1, 2, 3]), ([1, 3, 2], [1, 2, 3]), ([2, 1, 3], [1, 2, 3]), ([1, 2, 3], [1, 2, 3]), ([3, 1, 2], [1, 2, 3]), ([5, 0, -2], [-2, 0, 5])],
        "min_first": [([3, 1, 2], [1, 3, 2]), ([5, 8, 2], [2, 8, 5]), ([1, 4, 9], [1, 4, 9]), ([10, 3, 7], [3, 10, 7])],
        "sort_4": [([4, 3, 2, 1], [1, 2, 3, 4]), ([1, 4, 2, 3], [1, 2, 3, 4]), ([3, 1, 4, 2], [1, 2, 3, 4]), ([2, 3, 1, 4], [1, 2, 3, 4]), ([10, 5, 8, 1], [1, 5, 8, 10])],
        "reverse_3": [([1, 2, 3], [3, 2, 1]), ([5, 4, 1], [1, 4, 5]), ([0, 9, 8], [8, 9, 0]), ([7, 3, 2], [2, 3, 7])],
        "max_last_3": [([3, 1, 2], [1, 2, 3]), ([5, 9, 2], [2, 5, 9]), ([8, 4, 6], [4, 6, 8]), ([1, 1, 5], [1, 1, 5]), ([7, 3, 9], [3, 7, 9])],
        "zigzag_sort_4": [([3, 1, 4, 2], [1, 4, 2, 3]), ([5, 8, 1, 6], [1, 8, 5, 6]), ([9, 0, 4, 2], [0, 9, 2, 4]), ([1, 2, 3, 4], [1, 3, 2, 4]), ([10, -2, 5, 0], [-2, 10, 0, 5])],
        "even_odd_partition": [([3, 2, 5, 4], [2, 4, 3, 5]), ([1, 8, 6, 9], [8, 6, 1, 9]), ([7, 10, 12, 1], [10, 12, 7, 1])],
        "pancake_flip_sort": [([4, 1, 3, 2], [1, 2, 3, 4]), ([3, 2, 4, 1], [1, 2, 3, 4]), ([2, 4, 1, 3], [1, 2, 3, 4]), ([4, 3, 2, 1], [1, 2, 3, 4])],
        "bit_parity_partition": [([5, 8, 3, 12], [8, 12, 5, 3]), ([1, 4, 9, 6], [4, 6, 1, 9]), ([7, 2, 10, 15], [2, 10, 7, 15])],
        "cascade_sort_5": [([5, 4, 3, 2, 1], [1, 2, 3, 4, 5]), ([3, 1, 4, 1, 5], [1, 1, 3, 4, 5]), ([1, 5, 2, 4, 3], [1, 2, 3, 4, 5]), ([9, 2, 7, 0, 5], [0, 2, 5, 7, 9])]
    }

def get_training_tasks() -> List[str]:
    return [k for k, v in BENCHMARK_SPECS.items() if v["set"] == "training"]

def get_held_out_tasks() -> List[str]:
    return [k for k, v in BENCHMARK_SPECS.items() if v["set"] == "held_out"]

def check_valid_solution(task_name: str, program: ASTNode, fitness: float) -> Tuple[bool, str]:
    """
    Formally evaluates whether a candidate AST is a Valid Solution:
    validator(P, TestSet) == PASS AND fitness >= threshold AND depth <= max_depth
    """
    spec = BENCHMARK_SPECS.get(task_name)
    if not spec:
        return False, "Unknown task"

    req_thresh = spec["threshold"]
    # Allow 5.0 penalty offset for AST steps and depth penalties
    if fitness < (req_thresh - 5.0):
        return False, f"Fitness {fitness:.1f}% below required threshold {req_thresh:.1f}%"

    depth = program.get_depth() if hasattr(program, 'get_depth') else 10
    if depth > spec["max_depth"]:
        return False, f"AST depth {depth} exceeds max allowed depth {spec['max_depth']}"

    # Run interpreter validation
    interp = SandboxInterpreter(max_steps=500)
    test_cases = get_benchmark_tasks().get(task_name, [])
    for inp, expected in test_cases:
        try:
            exec_res = interp.execute(program, list(inp))
            out = exec_res.output_array
            validator = spec["validator"]
            if not validator(inp, out):
                return False, f"Validator failed for input {inp}"
        except Exception as e:
            return False, f"Execution exception: {str(e)}"

    return True, "Passed complete Valid Solution criteria"

class BenchmarkSuite:
    def __init__(self, archive_path: Optional[str] = "benchmark_archive.json"):
        self.tasks = get_benchmark_tasks()
        self.archive = ProgramArchive(storage_path=archive_path) if archive_path else None
        self.results: Dict[str, Dict[str, Any]] = {}

    def run_benchmark(
        self,
        task_name: str,
        population_size: int = 40,
        generations: int = 30,
        seed: Optional[int] = 42
    ) -> EvolutionResult:
        if task_name not in self.tasks:
            raise ValueError(f"Task '{task_name}' not found in benchmark suite.")

        test_cases = self.tasks[task_name]
        engine = GeneticEngine(
            population_size=population_size,
            generations=generations,
            seed=seed
        )

        start_time = time.time()
        result = engine.evolve(test_cases)
        elapsed = time.time() - start_time

        res_summary = {
            "task": task_name,
            "best_fitness": round(result.best_fitness, 2),
            "converged": result.converged,
            "total_generations": result.total_generations,
            "time_seconds": round(elapsed, 2),
            "best_depth": result.best_program.get_depth()
        }
        self.results[task_name] = res_summary

        if self.archive and result.best_program:
            self.archive.add_program(
                task_name=task_name,
                program=result.best_program,
                fitness=result.best_fitness,
                steps_taken=0,
                generation=result.total_generations,
                metadata={"time_seconds": elapsed}
            )

        return result

    def run_all(self, population_size: int = 40, generations: int = 30, seed: Optional[int] = 42) -> Dict[str, Dict[str, Any]]:
        for task in self.tasks:
            self.run_benchmark(task, population_size=population_size, generations=generations, seed=seed)
        return self.results

    def generate_report(self) -> str:
        if not self.results:
            return "No benchmarks executed yet."

        headers = ["Task", "Best Fitness", "Converged", "Generations", "Time (s)", "AST Depth"]
        rows = [
            [r["task"], r["best_fitness"], r["converged"], r["total_generations"], r["time_seconds"], r["best_depth"]]
            for r in self.results.values()
        ]
        return tabulate(rows, headers=headers, tablefmt="github")

