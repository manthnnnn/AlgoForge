import sys
import os

# Ensure dsl is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import (
    ProgramNode, CompareSwapNode, ConstNode, LoopNode, AssignNode
)
from dsl.interpreter import SandboxInterpreter

def test_compare_swap():
    interpreter = SandboxInterpreter()
    
    # Program: CompareSwap(0, 1)
    prog = ProgramNode([
        CompareSwapNode(ConstNode(0), ConstNode(1))
    ])
    
    input_arr = [3, 1]
    res = interpreter.execute(prog, input_arr)
    
    assert not res.timed_out
    assert not res.error_encountered
    assert res.output_array == [1, 3]

def test_timeout():
    # Set max steps low to easily test timeout
    interpreter = SandboxInterpreter(max_steps=15)
    
    # Program: Loop from 0 to 100
    prog = ProgramNode([
        LoopNode(
            var_name="i",
            start=ConstNode(0),
            end=ConstNode(100),
            body=[
                AssignNode("x", ConstNode(1))
            ]
        )
    ])
    
    input_arr = [1, 2, 3]
    res = interpreter.execute(prog, input_arr)
    
    assert res.timed_out
    assert res.steps_taken == 15
    assert res.output_array == [1, 2, 3]

def test_isolated_state():
    interpreter = SandboxInterpreter()
    
    # Program: CompareSwap(0, 1)
    prog = ProgramNode([
        CompareSwapNode(ConstNode(0), ConstNode(1))
    ])
    
    input_arr = [3, 1]
    res = interpreter.execute(prog, input_arr)
    
    assert res.output_array == [1, 3]
    assert input_arr == [3, 1]  # Should remain unchanged

def test_out_of_bounds_compare_swap():
    interpreter = SandboxInterpreter()
    
    prog = ProgramNode([
        CompareSwapNode(ConstNode(0), ConstNode(5))
    ])
    
    input_arr = [3, 1]
    res = interpreter.execute(prog, input_arr)
    
    assert res.error_encountered
    assert "Index out of bounds" in res.error_message
    assert res.output_array == [3, 1]

if __name__ == "__main__":
    test_compare_swap()
    test_timeout()
    test_isolated_state()
    test_out_of_bounds_compare_swap()
    print("All interpreter tests passed!")