import ast

from attached_tree import AttachedTree


class TrackerAttacher(ast.NodeTransformer):
    def __init__(self, tracker_identifier: str):
        self.tracker_identifier = tracker_identifier

    def __add_tracker(self, node: ast.expr) -> ast.Call:
        line = ast.Constant(value=node.lineno)
        end_line = ast.Constant(value=node.end_lineno)

        col = ast.Constant(value=node.col_offset)
        end_col = ast.Constant(value=node.end_col_offset)

        return ast.Call(
            func=ast.Name(id=self.tracker_identifier, ctx=ast.Load()),
            args=[node, line, end_line, col, end_col],
            keywords=[],
        )

    def visit(self, node: ast.AST) -> ast.AST:
        match node:
            case ast.Name(ctx=ast.Del()) | ast.Name(ctx=ast.Store()):
                pass

            case ast.JoinedStr():
                for value in node.values:
                    if isinstance(value, ast.FormattedValue):
                        self.generic_visit(value)

            case ast.expr():
                self.generic_visit(node)
                return self.__add_tracker(node)

            case ast.FunctionDef():
                for n in node.body:
                    self.generic_visit(n)
            case _:
                self.generic_visit(node)

        return node

    def attach(self, tree: ast.Module) -> AttachedTree:
        result: ast.Module = ast.fix_missing_locations(self.visit(tree))  # type: ignore
        return AttachedTree(result, self.tracker_identifier)
