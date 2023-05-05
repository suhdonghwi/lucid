import ast

from attached_tree import AttachedTree


class TrackerAttacher(ast.NodeTransformer):
    def __init__(self, tracker_identifier: str):
        self.tracker_identifier = tracker_identifier

    def __add_tracker(self, node: ast.expr) -> ast.Call:
        line_range = ast.Tuple(
            elts=[
                ast.Constant(value=node.lineno),
                ast.Constant(value=node.end_lineno),
            ],
            ctx=ast.Load(),
        )

        col_range = ast.Tuple(
            elts=[
                ast.Constant(value=node.col_offset),
                ast.Constant(value=node.end_col_offset),
            ],
            ctx=ast.Load(),
        )

        return ast.Call(
            func=ast.Name(id=self.tracker_identifier, ctx=ast.Load()),
            args=[node, line_range, col_range],
            keywords=[],
        )

    def __visit_only_expr(self, node: ast.AST):
        match node:
            case ast.FunctionDef():
                for n in node.body:
                    self.generic_visit(n)
            case ast.For():
                self.generic_visit(node.iter)
                for n in node.body:
                    self.generic_visit(n)
            case _:
                self.generic_visit(node)

    def visit(self, node: ast.AST) -> ast.AST:
        self.__visit_only_expr(node)

        if isinstance(node, ast.expr):
            node = self.__add_tracker(node)

        return node

    def attach(self, tree: ast.Module) -> AttachedTree:
        result: ast.Module = ast.fix_missing_locations(self.visit(tree))  # type: ignore
        return AttachedTree(result, self.tracker_identifier)
