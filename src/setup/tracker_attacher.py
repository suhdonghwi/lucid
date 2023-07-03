import ast
from typing import TypeVar

import tracker_identifier as IDENT


class TrackerAttacher(ast.NodeTransformer):
    def __add_expr_tracker(self, node: ast.expr) -> ast.Call:
        index_node = ast.Constant(value=node._index)

        before_call = ast.Call(
            func=ast.Name(id=IDENT.TRACKER_BEFORE_EXPR, ctx=ast.Load()),
            args=[index_node],
            keywords=[],
        )

        after_call = ast.Call(
            func=ast.Name(id=IDENT.TRACKER_AFTER_EXPR, ctx=ast.Load()),
            args=[before_call, node],
            keywords=[],
        )

        return after_call

    Node = TypeVar("Node", bound=ast.AST)

    def visit(self, node: Node) -> Node:
        match node:
            case ast.Name(ctx=ast.Del()) | ast.Name(ctx=ast.Store()):
                pass

            case ast.JoinedStr():
                for value in node.values:
                    if isinstance(value, ast.FormattedValue):
                        self.generic_visit(value)

            case ast.expr():
                self.generic_visit(node)
                return self.__add_expr_tracker(node)

            case ast.FunctionDef():
                for n in node.body:
                    self.generic_visit(n)
            case _:
                self.generic_visit(node)

        return node

    def attach(self, tree: ast.Module) -> ast.Module:
        return ast.fix_missing_locations(self.visit(tree))
