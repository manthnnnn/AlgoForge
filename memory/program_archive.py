import json
import os
import time
from typing import List, Dict, Any, Optional
from dsl.ast_nodes import ProgramNode, deserialize_node

class ProgramArchive:
    """
    ProgramArchive manages persistence and pareto-optimal tracking of evolved AST programs.
    """
    def __init__(self, storage_path: str = "program_archive.json"):
        self.storage_path = storage_path
        self.entries: List[Dict[str, Any]] = []
        self.load()

    def _program_signature(self, program: ProgramNode) -> str:
        """Generate a canonical string signature for a program to detect duplicates."""
        return str(program)

    def is_duplicate(self, task_name: str, program: ProgramNode) -> bool:
        """Returns True if an identical program (same structure) already exists in the archive for this task."""
        sig = self._program_signature(program)
        for e in self.entries:
            if e["task_name"] == task_name:
                try:
                    existing = deserialize_node(e["program_ast"])
                    if self._program_signature(existing) == sig:
                        return True
                except Exception:
                    pass
        return False

    def is_best_for_task(self, task_name: str, fitness: float) -> bool:
        """Returns True if this is the highest fitness program ever found for this task."""
        task_entries = [e for e in self.entries if e["task_name"] == task_name]
        if not task_entries:
            return True
        return fitness > max(e["fitness"] for e in task_entries)

    def add_program(
        self, 
        task_name: str, 
        program: ProgramNode, 
        fitness: float, 
        steps_taken: int, 
        generation: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Adds an evolved program to the archive with performance stats.
        Marks entry as duplicate if structurally identical to an existing one.
        """
        is_dup = self.is_duplicate(task_name, program)
        is_best = self.is_best_for_task(task_name, fitness)
        entry = {
            "id": len(self.entries) + 1,
            "task_name": task_name,
            "fitness": round(fitness, 4),
            "steps_taken": steps_taken,
            "ast_depth": program.get_depth(),
            "generation": generation,
            "timestamp": time.time(),
            "program_ast": program.to_dict(),
            "is_duplicate": is_dup,
            "is_best": is_best,
            "metadata": metadata or {}
        }
        self.entries.append(entry)
        self.save()
        return entry

    def get_best_program(self, task_name: str) -> Optional[ProgramNode]:
        """
        Returns the AST ProgramNode for the highest fitness program saved for task_name.
        """
        task_entries = [e for e in self.entries if e["task_name"] == task_name]
        if not task_entries:
            return None
        best_entry = max(task_entries, key=lambda x: x["fitness"])
        return deserialize_node(best_entry["program_ast"])

    def get_pareto_front(self, task_name: str) -> List[Dict[str, Any]]:
        """
        Calculates Pareto-optimal programs for task_name balancing high fitness, low AST depth, and low step count.
        A program A dominates program B if A is >= B in all criteria and strictly > in at least one.
        """
        task_entries = [e for e in self.entries if e["task_name"] == task_name]
        if not task_entries:
            return []

        pareto = []
        for a in task_entries:
            dominated = False
            for b in task_entries:
                if a == b:
                    continue
                # B dominates A if B.fitness >= A.fitness, B.depth <= A.depth, B.steps <= A.steps
                # with at least one strict inequality.
                if (b["fitness"] >= a["fitness"] and 
                    b["ast_depth"] <= a["ast_depth"] and 
                    b["steps_taken"] <= a["steps_taken"]):
                    if (b["fitness"] > a["fitness"] or 
                        b["ast_depth"] < a["ast_depth"] or 
                        b["steps_taken"] < a["steps_taken"]):
                        dominated = True
                        break
            if not dominated:
                pareto.append(a)

        return pareto

    def save(self) -> None:
        """
        Saves archive to JSON file if path is specified and valid.
        """
        if not self.storage_path or self.storage_path == ":memory:":
            return
        dir_name = os.path.dirname(self.storage_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(self.entries, f, indent=2)

    def load(self) -> None:
        """
        Loads archive from JSON file if it exists.
        """
        if not self.storage_path or self.storage_path == ":memory:":
            self.entries = []
            return
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.entries = json.load(f)
            except Exception:
                self.entries = []
        else:
            self.entries = []
