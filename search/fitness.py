from typing import List, Tuple
from dsl.ast_nodes import ProgramNode
from dsl.interpreter import SandboxInterpreter

def evaluate_fitness(program: ProgramNode, test_cases: List[Tuple[List[int], List[int]]], max_steps: int = 500) -> float:
    """
    Evaluates fitness based on:
    Fitness = S_correctness - (P_steps * 0.01) - (P_depth * 0.1)
    Crash penalty = -1000.0
    """
    interpreter = SandboxInterpreter(max_steps=max_steps)
    
    total_correctness = 0.0
    total_steps = 0
    num_cases = len(test_cases)
    
    if num_cases == 0:
        return 0.0
        
    for input_arr, expected_arr in test_cases:
        res = interpreter.execute(program, input_arr)
        
        if res.timed_out or res.error_encountered:
            return -1000.0
            
        # Correctness percentage
        correct_count = sum(1 for a, b in zip(res.output_array, expected_arr) if a == b)
        max_len = max(len(res.output_array), len(expected_arr))
        
        if max_len > 0:
            correctness = (correct_count / max_len) * 100.0
        else:
            correctness = 100.0
            
        total_correctness += correctness
        total_steps += res.steps_taken
        
    avg_correctness = total_correctness / num_cases
    avg_steps = total_steps / num_cases
    p_depth = program.get_depth()
    
    fitness = avg_correctness - (avg_steps * 0.01) - (p_depth * 0.1)
    return fitness
