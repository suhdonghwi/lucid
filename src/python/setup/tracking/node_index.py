import ast


def set_index(node: ast.AST, index: int):
    setattr(node, "_index", index)


def get_index(node: ast.AST) -> int:
    return getattr(node, "_index")
