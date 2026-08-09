import copy
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from .ast_nodes import (
    ASTNode, ProgramNode, ConstNode, VariableNode, 
    CompareSwapNode, AssignNode, LoopNode, IfNode, BinaryOpNode
)

from dataclasses import dataclass, field

@dataclass
class ExecutionResult:
    output_array: List[int]
    steps_taken: int
    timed_out: bool
    error_encountered: bool
    error_message: Optional[str]
    trace: List[Dict[str, Any]] = field(default_factory=list)

class SandboxInterpreter:
    def __init__(self, max_steps: int = 500):
        self.max_steps = max_steps
        self.step_count = 0
        self.timed_out = False
        self.error_encountered = False
        self.error_message = None
        self.env: Dict[str, Any] = {}
        self.arr: List[int] = []
        self.trace: List[Dict[str, Any]] = []

    def execute(self, program: ProgramNode, input_array: List[int]) -> ExecutionResult:
        self.step_count = 0
        self.timed_out = False
        self.error_encountered = False
        self.error_message = None
        
        # Isolated state
        self.arr = copy.deepcopy(input_array)
        self.env = {"len": len(self.arr)}
        self.trace = [{"step": 0, "action": "Initial state", "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)}]

        try:
            self._eval(program)
        except TimeoutError:
            self.timed_out = True
        except Exception as e:
            self.error_encountered = True
            self.error_message = str(e)
            
        return ExecutionResult(
            output_array=self.arr,
            steps_taken=self.step_count,
            timed_out=self.timed_out,
            error_encountered=self.error_encountered,
            error_message=self.error_message,
            trace=self.trace
        )

    def _eval(self, node: ASTNode) -> Any:
        self.step_count += 1
        if self.step_count >= self.max_steps:
            raise TimeoutError("Step limit exceeded")

        if isinstance(node, ProgramNode):
            for stmt in node.statements:
                self._eval(stmt)
            return None
        
        elif isinstance(node, ConstNode):
            return node.value
            
        elif isinstance(node, VariableNode):
            if node.name in self.env:
                return self.env[node.name]
            elif node.name == "arr":
                return self.arr
            else:
                raise ValueError(f"Undefined variable: {node.name}")

        elif isinstance(node, BinaryOpNode):
            left_val = self._eval(node.left)
            right_val = self._eval(node.right)
            op = node.op
            if op == "+": return left_val + right_val
            elif op == "-": return left_val - right_val
            elif op == "*": return left_val * right_val
            elif op == "%": return left_val % right_val if right_val != 0 else 0
            elif op == "//": return left_val // right_val if right_val != 0 else 0
            elif op == "&": return left_val & right_val
            elif op == "|": return left_val | right_val
            elif op == "^": return left_val ^ right_val
            elif op == "<": return left_val < right_val
            elif op == ">": return left_val > right_val
            elif op == "==": return left_val == right_val
            elif op == "!=": return left_val != right_val
            elif op == "<=": return left_val <= right_val
            elif op == ">=": return left_val >= right_val
            else: raise ValueError(f"Unsupported binary operator: {op}")
                
        elif isinstance(node, CompareSwapNode):
            idx1 = self._eval(node.idx1)
            idx2 = self._eval(node.idx2)
            if not isinstance(idx1, int) or not isinstance(idx2, int):
                raise TypeError("CompareSwap indices must be integers")
                
            if 0 <= idx1 < len(self.arr) and 0 <= idx2 < len(self.arr):
                swapped = False
                if self.arr[idx1] > self.arr[idx2]:
                    self.arr[idx1], self.arr[idx2] = self.arr[idx2], self.arr[idx1]
                    swapped = True
                action = f"CompareSwap({idx1}, {idx2}) -> {'swapped' if swapped else 'no swap'}"
                self.trace.append({"step": self.step_count, "action": action, "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)})
            else:
                self.error_encountered = True
                self.error_message = "Index out of bounds in CompareSwap"
            return None

        elif isinstance(node, SwapNode):
            idx1 = self._eval(node.idx1)
            idx2 = self._eval(node.idx2)
            if not isinstance(idx1, int) or not isinstance(idx2, int):
                raise TypeError("Swap indices must be integers")
            if 0 <= idx1 < len(self.arr) and 0 <= idx2 < len(self.arr):
                self.arr[idx1], self.arr[idx2] = self.arr[idx2], self.arr[idx1]
                action = f"Swap({idx1}, {idx2})"
                self.trace.append({"step": self.step_count, "action": action, "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)})
            else:
                self.error_encountered = True
                self.error_message = "Index out of bounds in Swap"
            return None

        elif isinstance(node, ReverseRangeNode):
            start = self._eval(node.start)
            end = self._eval(node.end)
            if not isinstance(start, int) or not isinstance(end, int):
                raise TypeError("Reverse range indices must be integers")
            s = max(0, min(start, len(self.arr)))
            e = max(s, min(end, len(self.arr)))
            if e > s:
                self.arr[s:e] = list(reversed(self.arr[s:e]))
                action = f"ReverseRange({s}, {e})"
                self.trace.append({"step": self.step_count, "action": action, "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)})
            return None

        elif isinstance(node, ArrayAssignNode):
            idx = self._eval(node.idx)
            val = self._eval(node.value)
            if not isinstance(idx, int) or not isinstance(val, int):
                raise TypeError("Array assign index and value must be integers")
            if 0 <= idx < len(self.arr):
                self.arr[idx] = val
                action = f"ArrayAssign arr[{idx}] = {val}"
                self.trace.append({"step": self.step_count, "action": action, "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)})
            else:
                self.error_encountered = True
                self.error_message = "Index out of bounds in ArrayAssign"
            return None

        elif isinstance(node, AssignNode):
            val = self._eval(node.value)
            self.env[node.var_name] = val
            self.trace.append({"step": self.step_count, "action": f"Assign {node.var_name} = {val}", "array": copy.deepcopy(self.arr), "env": copy.deepcopy(self.env)})
            return None

            
        elif isinstance(node, LoopNode):
            start_val = self._eval(node.start)
            end_val = self._eval(node.end)
            if not isinstance(start_val, int) or not isinstance(end_val, int):
                raise TypeError("Loop bounds must be integers")
                
            for i in range(start_val, end_val):
                self.env[node.var_name] = i
                for stmt in node.body:
                    self._eval(stmt)
            return None
            
        elif isinstance(node, IfNode):
            cond_val = self._eval(node.condition)
            if cond_val:
                for stmt in node.then_body:
                    self._eval(stmt)
            else:
                if node.else_body:
                    for stmt in node.else_body:
                        self._eval(stmt)
            return None
            
        raise ValueError(f"Unknown node type during execution: {type(node)}")
