from abc import ABC, abstractmethod
from typing import List, Dict, Any, Union
from dataclasses import dataclass

class ASTNode(ABC):
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        pass

    @classmethod
    @abstractmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ASTNode':
        pass

    @abstractmethod
    def get_depth(self) -> int:
        pass

@dataclass
class ConstNode(ASTNode):
    value: int
    
    def to_dict(self): 
        return {"type": "ConstNode", "value": self.value}
        
    @classmethod
    def from_dict(cls, data): 
        return cls(value=data["value"])
        
    def get_depth(self): 
        return 1

@dataclass
class VariableNode(ASTNode):
    name: str
    
    def to_dict(self): 
        return {"type": "VariableNode", "name": self.name}
        
    @classmethod
    def from_dict(cls, data): 
        return cls(name=data["name"])
        
    def get_depth(self): 
        return 1

@dataclass
class CompareSwapNode(ASTNode):
    idx1: ASTNode
    idx2: ASTNode
    
    def to_dict(self): 
        return {"type": "CompareSwapNode", "idx1": self.idx1.to_dict(), "idx2": self.idx2.to_dict()}
        
    @classmethod
    def from_dict(cls, data): 
        return cls(idx1=deserialize_node(data["idx1"]), idx2=deserialize_node(data["idx2"]))
        
    def get_depth(self): 
        return 1 + max(self.idx1.get_depth(), self.idx2.get_depth())

@dataclass
class AssignNode(ASTNode):
    var_name: str
    value: ASTNode
    
    def to_dict(self): 
        return {"type": "AssignNode", "var_name": self.var_name, "value": self.value.to_dict()}
        
    @classmethod
    def from_dict(cls, data): 
        return cls(var_name=data["var_name"], value=deserialize_node(data["value"]))
        
    def get_depth(self): 
        return 1 + self.value.get_depth()

@dataclass
class LoopNode(ASTNode):
    var_name: str
    start: ASTNode
    end: ASTNode
    body: List[ASTNode]
    
    def to_dict(self): 
        return {
            "type": "LoopNode", 
            "var_name": self.var_name, 
            "start": self.start.to_dict(), 
            "end": self.end.to_dict(), 
            "body": [n.to_dict() for n in self.body]
        }
        
    @classmethod
    def from_dict(cls, data): 
        return cls(
            var_name=data["var_name"], 
            start=deserialize_node(data["start"]), 
            end=deserialize_node(data["end"]), 
            body=[deserialize_node(n) for n in data["body"]]
        )
        
    def get_depth(self): 
        body_depth = max([n.get_depth() for n in self.body]) if self.body else 0
        return 1 + max(self.start.get_depth(), self.end.get_depth(), body_depth)

@dataclass
class IfNode(ASTNode):
    condition: ASTNode
    then_body: List[ASTNode]
    else_body: List[ASTNode]
    
    def to_dict(self): 
        return {
            "type": "IfNode", 
            "condition": self.condition.to_dict(), 
            "then_body": [n.to_dict() for n in self.then_body], 
            "else_body": [n.to_dict() for n in self.else_body]
        }
        
    @classmethod
    def from_dict(cls, data): 
        return cls(
            condition=deserialize_node(data["condition"]), 
            then_body=[deserialize_node(n) for n in data["then_body"]], 
            else_body=[deserialize_node(n) for n in data["else_body"]]
        )
        
    def get_depth(self): 
        then_depth = max([n.get_depth() for n in self.then_body]) if self.then_body else 0
        else_depth = max([n.get_depth() for n in self.else_body]) if self.else_body else 0
        return 1 + max(self.condition.get_depth(), then_depth, else_depth)

@dataclass
class BinaryOpNode(ASTNode):
    left: ASTNode
    op: str
    right: ASTNode

    def to_dict(self):
        return {
            "type": "BinaryOpNode",
            "left": self.left.to_dict(),
            "op": self.op,
            "right": self.right.to_dict()
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            left=deserialize_node(data["left"]),
            op=data["op"],
            right=deserialize_node(data["right"])
        )

    def get_depth(self):
        return 1 + max(self.left.get_depth(), self.right.get_depth())

@dataclass
class SwapNode(ASTNode):
    idx1: ASTNode
    idx2: ASTNode

    def to_dict(self):
        return {"type": "SwapNode", "idx1": self.idx1.to_dict(), "idx2": self.idx2.to_dict()}

    @classmethod
    def from_dict(cls, data):
        return cls(idx1=deserialize_node(data["idx1"]), idx2=deserialize_node(data["idx2"]))

    def get_depth(self):
        return 1 + max(self.idx1.get_depth(), self.idx2.get_depth())

@dataclass
class ReverseRangeNode(ASTNode):
    start: ASTNode
    end: ASTNode

    def to_dict(self):
        return {"type": "ReverseRangeNode", "start": self.start.to_dict(), "end": self.end.to_dict()}

    @classmethod
    def from_dict(cls, data):
        return cls(start=deserialize_node(data["start"]), end=deserialize_node(data["end"]))

    def get_depth(self):
        return 1 + max(self.start.get_depth(), self.end.get_depth())

@dataclass
class ArrayAssignNode(ASTNode):
    idx: ASTNode
    value: ASTNode

    def to_dict(self):
        return {"type": "ArrayAssignNode", "idx": self.idx.to_dict(), "value": self.value.to_dict()}

    @classmethod
    def from_dict(cls, data):
        return cls(idx=deserialize_node(data["idx"]), value=deserialize_node(data["value"]))

    def get_depth(self):
        return 1 + max(self.idx.get_depth(), self.value.get_depth())

@dataclass
class ProgramNode(ASTNode):
    statements: List[ASTNode]
    
    def to_dict(self): 
        return {"type": "ProgramNode", "statements": [n.to_dict() for n in self.statements]}
        
    @classmethod
    def from_dict(cls, data): 
        return cls(statements=[deserialize_node(n) for n in data["statements"]])
        
    def get_depth(self):
        if not self.statements:
            return 1
        return 1 + max(n.get_depth() for n in self.statements)

def deserialize_node(data: Dict[str, Any]) -> ASTNode:
    if not isinstance(data, dict) or "type" not in data:
        raise ValueError(f"Invalid AST node data: {data}")
        
    node_type = data["type"]
    if node_type == "ConstNode": return ConstNode.from_dict(data)
    elif node_type == "VariableNode": return VariableNode.from_dict(data)
    elif node_type == "CompareSwapNode": return CompareSwapNode.from_dict(data)
    elif node_type == "SwapNode": return SwapNode.from_dict(data)
    elif node_type == "ReverseRangeNode": return ReverseRangeNode.from_dict(data)
    elif node_type == "ArrayAssignNode": return ArrayAssignNode.from_dict(data)
    elif node_type == "AssignNode": return AssignNode.from_dict(data)
    elif node_type == "LoopNode": return LoopNode.from_dict(data)
    elif node_type == "IfNode": return IfNode.from_dict(data)
    elif node_type == "BinaryOpNode": return BinaryOpNode.from_dict(data)
    elif node_type == "ProgramNode": return ProgramNode.from_dict(data)
    else: raise ValueError(f"Unknown node type: {node_type}")

