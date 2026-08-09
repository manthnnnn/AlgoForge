import sys
import os
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import ProgramNode, CompareSwapNode, ConstNode
from memory.program_archive import ProgramArchive

def test_archive_save_load():
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        archive = ProgramArchive(storage_path=tmp_path)
        prog = ProgramNode([CompareSwapNode(ConstNode(0), ConstNode(1))])
        
        archive.add_program(
            task_name="sort_2",
            program=prog,
            fitness=98.5,
            steps_taken=3,
            generation=10
        )
        
        # Load in new instance
        loaded_archive = ProgramArchive(storage_path=tmp_path)
        assert len(loaded_archive.entries) == 1
        
        best = loaded_archive.get_best_program("sort_2")
        assert best is not None
        assert isinstance(best, ProgramNode)
        assert len(best.statements) == 1
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def test_pareto_front():
    archive = ProgramArchive(storage_path=":memory:")
    prog1 = ProgramNode([CompareSwapNode(ConstNode(0), ConstNode(1))])
    
    # High fitness, low depth, low steps (Dominates)
    archive.add_program("sort", prog1, fitness=99.0, steps_taken=5, generation=1)
    # Low fitness, higher depth, more steps
    archive.add_program("sort", prog1, fitness=80.0, steps_taken=10, generation=2)
    
    pareto = archive.get_pareto_front("sort")
    assert len(pareto) == 1
    assert pareto[0]["fitness"] == 99.0

if __name__ == "__main__":
    test_archive_save_load()
    test_pareto_front()
    print("All archive tests passed!")
