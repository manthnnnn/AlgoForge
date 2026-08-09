import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import ProgramNode, CompareSwapNode, ConstNode
from memory.program_archive import ProgramArchive
from benchmarks.suite import BenchmarkSuite

def test_program_archive():
    archive_path = "scratch_test_archive.json"
    if os.path.exists(archive_path):
        os.remove(archive_path)

    archive = ProgramArchive(storage_path=archive_path)
    prog = ProgramNode([CompareSwapNode(ConstNode(0), ConstNode(1))])

    entry = archive.add_program("sort_2", prog, fitness=98.5, steps_taken=5, generation=10)
    assert entry["task_name"] == "sort_2"
    assert entry["fitness"] == 98.5

    best = archive.get_best_program("sort_2")
    assert best is not None
    assert best.to_dict() == prog.to_dict()

    pareto = archive.get_pareto_front("sort_2")
    assert len(pareto) > 0

    if os.path.exists(archive_path):
        os.remove(archive_path)

def test_benchmark_suite():
    suite = BenchmarkSuite(archive_path=None)
    res = suite.run_benchmark("sort_2", population_size=20, generations=10, seed=42)
    assert res.best_fitness > 0
    report = suite.generate_report()
    assert "sort_2" in report

if __name__ == "__main__":
    test_program_archive()
    test_benchmark_suite()
    print("All memory and benchmark tests passed!")
