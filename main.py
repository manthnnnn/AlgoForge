import argparse
import json
from benchmarks.suite import BenchmarkSuite, get_benchmark_tasks
from search.genetic_engine import GeneticEngine
from memory.program_archive import ProgramArchive

def main():
    parser = argparse.ArgumentParser(description="ALGOFORGE: Genetic Program Synthesis for Algorithms")
    parser.add_argument("--task", type=str, default="sort_2", help="Benchmark task name (e.g. sort_2, sort_3, reverse_3, min_first)")
    parser.add_argument("--all-benchmarks", action="store_true", help="Run all benchmark tasks")
    parser.add_argument("--pop-size", type=int, default=50, help="Population size for genetic engine")
    parser.add_argument("--generations", type=int, default=50, help="Max generations")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--archive-path", type=str, default="program_archive.json", help="Path to program archive JSON file")
    args = parser.parse_args()

    suite = BenchmarkSuite(archive_path=args.archive_path)

    if args.all_benchmarks:
        print("Running full ALGOFORGE Benchmark Suite...\n")
        suite.run_all(population_size=args.pop_size, generations=args.generations, seed=args.seed)
        print(suite.generate_report())
    else:
        print(f"Running ALGOFORGE synthesis for task: {args.task}...\n")
        res = suite.run_benchmark(args.task, population_size=args.pop_size, generations=args.generations, seed=args.seed)
        print(f"Synthesis Complete!")
        print(f"Best Fitness: {res.best_fitness:.2f}")
        print(f"Converged: {res.converged}")
        print(f"Total Generations: {res.total_generations}")
        if res.best_program:
            print("\nEvolved AST Program:")
            print(json.dumps(res.best_program.to_dict(), indent=2))

if __name__ == "__main__":
    main()
