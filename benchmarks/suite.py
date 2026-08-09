from typing import Dict, List, Tuple, Any, Optional
import time
from tabulate import tabulate

from search.genetic_engine import GeneticEngine, EvolutionResult
from memory.program_archive import ProgramArchive

def get_benchmark_tasks() -> Dict[str, List[Tuple[List[int], List[int]]]]:
    """
    Returns benchmark tasks from trivially simple to complex novel problems.
    Complexity scales from sort_2 (trivial) -> cascade_sort_5 (novel).
    """
    return {
        # ── EASY: 2-element sort ── requires 1 compare-swap
        "sort_2": [
            ([2, 1], [1, 2]),
            ([1, 2], [1, 2]),
            ([5, 3], [3, 5]),
            ([0, 9], [0, 9]),
            ([10, -1], [-1, 10]),
        ],
        # ── EASY: 3-element sort ── requires 3 compare-swaps
        "sort_3": [
            ([3, 2, 1], [1, 2, 3]),
            ([1, 3, 2], [1, 2, 3]),
            ([2, 1, 3], [1, 2, 3]),
            ([1, 2, 3], [1, 2, 3]),
            ([3, 1, 2], [1, 2, 3]),
            ([5, 0, -2], [-2, 0, 5]),
        ],
        # ── EASY: put min first ──
        "min_first": [
            ([3, 1, 2], [1, 3, 2]),
            ([5, 8, 2], [2, 8, 5]),
            ([1, 4, 9], [1, 4, 9]),
            ([10, 3, 7], [3, 10, 7]),
        ],
        # ── MEDIUM: 4-element full sort ──
        "sort_4": [
            ([4, 3, 2, 1], [1, 2, 3, 4]),
            ([1, 4, 2, 3], [1, 2, 3, 4]),
            ([3, 1, 4, 2], [1, 2, 3, 4]),
            ([2, 3, 1, 4], [1, 2, 3, 4]),
            ([10, 5, 8, 1], [1, 5, 8, 10]),
        ],
        # ── MEDIUM: Reverse an array of 3 ──
        "reverse_3": [
            ([1, 2, 3], [3, 2, 1]),
            ([5, 4, 1], [1, 4, 5]),
            ([0, 9, 8], [8, 9, 0]),
            ([7, 3, 2], [2, 3, 7]),
        ],
        # ── HARD: Zig-Zag Sort (a < b > c < d) — NOVEL ALGORITHM ──
        # Pattern: valley-peak-valley-peak
        "zigzag_sort_4": [
            ([3, 1, 4, 2], [1, 4, 2, 3]),
            ([5, 8, 1, 6], [1, 8, 5, 6]),
            ([9, 0, 4, 2], [0, 9, 2, 4]),
            ([1, 2, 3, 4], [1, 3, 2, 4]),
            ([10, -2, 5, 0], [-2, 10, 0, 5]),
            ([6, 7, 8, 9], [6, 8, 7, 9]),
        ],
        # ── HARD: Partition Evens Before Odds — NOVEL ALGORITHM ──
        "even_odd_partition": [
            ([3, 2, 5, 4], [2, 4, 3, 5]),
            ([1, 8, 6, 9], [8, 6, 1, 9]),
            ([7, 10, 12, 1], [10, 12, 7, 1]),
        ],
        # ── HARD: Max-to-End Sort (keep max at end, sort rest) — NOVEL ──
        "max_last_3": [
            ([3, 1, 2], [1, 2, 3]),
            ([5, 9, 2], [2, 5, 9]),
            ([8, 4, 6], [4, 6, 8]),
            ([1, 1, 5], [1, 1, 5]),
            ([7, 3, 9], [3, 7, 9]),
        ],
        # ── HARD: Cascade Sort-5 (5 elements, needs 10 compare-swaps) ── NOVEL ──
        "cascade_sort_5": [
            ([5, 4, 3, 2, 1], [1, 2, 3, 4, 5]),
            ([3, 1, 4, 1, 5], [1, 1, 3, 4, 5]),
            ([1, 5, 2, 4, 3], [1, 2, 3, 4, 5]),
            ([9, 2, 7, 0, 5], [0, 2, 5, 7, 9]),
            ([8, 6, 4, 2, 0], [0, 2, 4, 6, 8]),
        ],
        # ── ULTRA NOVEL: 6-Element Bitonic Parallel Sort ──
        "bitonic_sort_6": [
            ([6, 5, 4, 1, 2, 3], [1, 2, 3, 4, 5, 6]),
            ([3, 2, 1, 6, 5, 4], [1, 2, 3, 4, 5, 6]),
            ([1, 6, 2, 5, 3, 4], [1, 2, 3, 4, 5, 6]),
            ([6, 1, 5, 2, 4, 3], [1, 2, 3, 4, 5, 6]),
        ],
        # ── ULTRA NOVEL: Pancake Prefix Reversal Sort ──
        "pancake_flip_sort": [
            ([4, 1, 3, 2], [1, 2, 3, 4]),
            ([3, 2, 4, 1], [1, 2, 3, 4]),
            ([2, 4, 1, 3], [1, 2, 3, 4]),
            ([4, 3, 2, 1], [1, 2, 3, 4]),
        ],
        # ── ULTRA NOVEL: Run-Length Compression & Compact ──
        "run_length_compress_6": [
            ([1, 1, 1, 2, 2, 3], [1, 3, 2, 2, 3, 1]),
            ([5, 5, 5, 5, 1, 1], [5, 4, 1, 2, 0, 0]),
            ([2, 2, 4, 4, 4, 4], [2, 2, 4, 4, 0, 0]),
        ],
        # ── ULTRA NOVEL: Bitwise Parity Partition ──
        "bit_parity_partition": [
            ([5, 8, 3, 12], [8, 12, 5, 3]),
            ([1, 4, 9, 6],  [4, 6, 1, 9]),
            ([7, 2, 10, 15],[2, 10, 7, 15]),
        ],
        # ── ULTRA NOVEL: Haar Wavelet Transform (Avgs & Diffs) ──
        "wavelet_haar_4": [
            ([4, 8, 2, 6], [6, 4, -2, -2]),
            ([10, 20, 30, 40], [15, 35, -5, -5]),
            ([2, 2, 6, 6], [2, 6, 0, 0]),
        ],
        # ── ULTRA EXPERT: 6-Element Cascade Sort Network ──
        "cascade_sort_6": [
            ([6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6]),
            ([2, 6, 1, 5, 3, 4], [1, 2, 3, 4, 5, 6]),
            ([4, 1, 5, 2, 6, 3], [1, 2, 3, 4, 5, 6]),
            ([3, 5, 1, 6, 2, 4], [1, 2, 3, 4, 5, 6]),
        ],
    }

TASK_DIFFICULTY = {
    "sort_2":                {"level": "Easy",    "chip": "easy",   "steps": "~1 swap",   "desc": "Sort 2 elements. Simplest possible task."},
    "sort_3":                {"level": "Easy",    "chip": "easy",   "steps": "~3 swaps",  "desc": "Sort 3 elements. Needs a 3-compare network."},
    "min_first":             {"level": "Easy",    "chip": "easy",   "steps": "~2 swaps",  "desc": "Move minimum to position 0."},
    "sort_4":                {"level": "Medium",  "chip": "medium", "steps": "~5 swaps",  "desc": "Sort 4 elements. Requires a full sorting network."},
    "reverse_3":             {"level": "Medium",  "chip": "medium", "steps": "~2 swaps",  "desc": "Reverse 3 elements in-place."},
    "max_last_3":            {"level": "Medium",  "chip": "medium", "steps": "~3 swaps",  "desc": "Push the maximum element to the last position."},
    "zigzag_sort_4":         {"level": "Hard",    "chip": "novel",  "steps": "~6 swaps",  "desc": "⚡ NOVEL: Arrange as valley-peak-valley-peak pattern."},
    "even_odd_partition":    {"level": "Hard",    "chip": "novel",  "steps": "~4 swaps",  "desc": "⚡ NOVEL: Partition even numbers before odd numbers."},
    "bisplit_4":             {"level": "Hard",    "chip": "novel",  "steps": "~6 swaps",  "desc": "⚡ NOVEL: Split array into sorted lower and upper halves."},
    "pancake_flip_sort":     {"level": "Ultra",   "chip": "novel",  "steps": "~6 flips",  "desc": "🌌 ULTRA NOVEL: Sort array using only prefix range flips."},
    "bit_parity_partition":  {"level": "Ultra",   "chip": "novel",  "steps": "~5 ops",    "desc": "🌌 ULTRA NOVEL: Partition numbers using bitwise parity."},
    "wavelet_haar_4":        {"level": "Ultra",   "chip": "novel",  "steps": "~8 ops",    "desc": "🌌 ULTRA NOVEL: Compute Haar Wavelet averages & differences."},
    "run_length_compress_6": {"level": "Ultra",   "chip": "novel",  "steps": "~10 ops",   "desc": "🌌 ULTRA NOVEL: Discover Run-Length Sequence Compression."},
    "bitonic_sort_6":        {"level": "Ultra",   "chip": "expert", "steps": "~12 swaps", "desc": "🚀 WORLD CHANGING: Evolve 6-element Bitonic Sorting Network."},
    "cascade_sort_5":        {"level": "Expert",  "chip": "hard",   "steps": "~10 swaps", "desc": "🔥 EXPERT: Full sort of 5 elements — needs many nested loops!"},
    "cascade_sort_6":        {"level": "Expert",  "chip": "expert", "steps": "~15 swaps", "desc": "🔥 EXPERT: Full non-linear 6-element sorting network!"},
}


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
