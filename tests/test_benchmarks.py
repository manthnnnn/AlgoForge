import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from benchmarks.suite import BenchmarkSuite, get_benchmark_tasks

def test_benchmark_tasks():
    tasks = get_benchmark_tasks()
    assert "sort_2" in tasks
    assert "sort_3" in tasks
    assert len(tasks["sort_2"]) > 0

def test_benchmark_suite_execution():
    suite = BenchmarkSuite(archive_path=":memory:")
    res = suite.run_benchmark("sort_2", population_size=10, generations=5, seed=123)
    assert res is not None
    report = suite.generate_report()
    assert "Task" in report
    assert "sort_2" in report

if __name__ == "__main__":
    test_benchmark_tasks()
    test_benchmark_suite_execution()
    print("All benchmark tests passed!")
