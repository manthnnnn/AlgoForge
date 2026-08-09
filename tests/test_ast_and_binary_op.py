import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import (
    ProgramNode, CompareSwapNode, ConstNode, VariableNode, 
    LoopNode, AssignNode, IfNode, BinaryOpNode, deserialize_node
)
from dsl.interpreter import SandboxInterpreter

def test_binary_op_eval():
    interpreter = SandboxInterpreter()
    
    # x = 5 + 3
    prog = ProgramNode([
        AssignNode("x", BinaryOpNode(ConstNode(5), "+", ConstNode(3)))
    ])
    
    res = interpreter.execute(prog, [1, 2, 3])
    assert not res.error_encountered
    assert interpreter.env["x"] == 8

def test_nested_binary_op_and_loops():
    interpreter = SandboxInterpreter()
    
    # Loop i from 0 to len - 1
    # CompareSwap(i, i + 1)
    prog = ProgramNode([
        LoopNode(
            var_name="i",
            start=ConstNode(0),
            end=BinaryOpNode(VariableNode("len"), "-", ConstNode(1)),
            body=[
                CompareSwapNode(
                    VariableNode("i"),
                    BinaryOpNode(VariableNode("i"), "+", ConstNode(1))
                )
            ]
        )
    ])
    
    input_arr = [5, 2, 1]
    res = interpreter.execute(prog, input_arr)
    assert not res.error_encountered
    # One pass of bubble sort on [5, 2, 1] -> [2, 1, 5]
    assert res.output_array == [2, 1, 5]

def test_ast_serialization():
    op_node = BinaryOpNode(VariableNode("i"), "+", ConstNode(1))
    d = op_node.to_dict()
    reconstructed = deserialize_node(d)
    assert isinstance(reconstructed, BinaryOpNode)
    assert reconstructed.op == "+"
    assert reconstructed.get_depth() == 2

if __name__ == "__main__":
    test_binary_op_eval()
    test_nested_binary_op_and_loops()
    test_ast_serialization()
    print("All AST and BinaryOp tests passed!")
