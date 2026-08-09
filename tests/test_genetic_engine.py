import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import ProgramNode, CompareSwapNode, ConstNode
from search.genetic_engine import (
    ASTGenerator, crossover, mutate, clone_program, GeneticEngine
)

def test_ast_generator():
    generator = ASTGenerator(max_depth=5)
    prog = generator.gen_program(min_statements=1, max_statements=3)
    assert isinstance(prog, ProgramNode)
    assert 1 <= len(prog.statements) <= 3
    assert prog.get_depth() <= 5

def test_crossover_and_mutation():
    generator = ASTGenerator(max_depth=5)
    p1 = generator.gen_program(1, 3)
    p2 = generator.gen_program(1, 3)

    c1, c2 = crossover(p1, p2, max_depth=6)
    assert isinstance(c1, ProgramNode)
    assert isinstance(c2, ProgramNode)

    m1 = mutate(c1, generator, mutation_rate=1.0, max_depth=6)
    assert isinstance(m1, ProgramNode)

def test_clone():
    prog = ProgramNode([CompareSwapNode(ConstNode(0), ConstNode(1))])
    cloned = clone_program(prog)
    assert cloned.to_dict() == prog.to_dict()
    assert cloned is not prog

def test_genetic_engine_convergence_sort2():
    # Test sort_2: inputs and outputs for 2-element arrays
    test_cases = [
        ([2, 1], [1, 2]),
        ([1, 2], [1, 2]),
        ([5, 3], [3, 5]),
        ([0, 9], [0, 9]),
        ([10, -1], [-1, 10])
    ]

    engine = GeneticEngine(
        population_size=30,
        generations=20,
        mutation_rate=0.3,
        crossover_rate=0.7,
        max_depth=4,
        target_fitness=90.0,
        seed=42
    )

    res = engine.evolve(test_cases)
    assert res.best_fitness > 50.0  # Should easily achieve high fitness
    assert len(res.history) > 0
    assert isinstance(res.best_program, ProgramNode)

if __name__ == "__main__":
    test_ast_generator()
    test_crossover_and_mutation()
    test_clone()
    test_genetic_engine_convergence_sort2()
    print("All genetic engine tests passed!")
