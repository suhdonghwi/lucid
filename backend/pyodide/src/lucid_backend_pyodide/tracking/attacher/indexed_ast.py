import ast

from typing import NewType

NodeIndex = NewType("NodeIndex", int)


class IndexedAST:
    linearized_ast: list[ast.AST] = []
    node_to_index_map: dict[ast.AST, NodeIndex] = {}

    def __init__(self, tree: ast.AST):
        for node in ast.walk(tree):
            self.node_to_index_map[node] = NodeIndex(len(self.linearized_ast))
            self.linearized_ast.append(node)

    def node_of(self, index: NodeIndex) -> ast.AST:
        return self.linearized_ast[index]

    def index_of(self, node: ast.AST) -> NodeIndex:
        index = self.node_to_index_map.get(node)

        if index is None:
            raise ValueError("Node not found in linearized AST")

        return index
