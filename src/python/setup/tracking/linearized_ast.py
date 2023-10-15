import ast


class LinearizedAST:
    linearized_ast: list[ast.AST] = []
    node_to_index_map: dict[ast.AST, int] = {}

    def __init__(self, tree: ast.AST):
        for node in ast.walk(tree):
            self.node_to_index_map[node] = len(self.linearized_ast)
            self.linearized_ast.append(node)

    def __getitem__(self, index: int) -> ast.AST:
        return self.linearized_ast[index]

    def index_of(self, node: ast.AST) -> int | None:
        return self.node_to_index_map.get(node)
