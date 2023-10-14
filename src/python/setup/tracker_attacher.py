import ast
from typing import TypeVar

import tracker_identifier as IDENT
from tracked_module.ast_index import get_index


class TrackerAttacher(ast.NodeTransformer):
    @staticmethod
    def add_expr_tracker(node: ast.expr) -> ast.Call:
        index_node = ast.Constant(value=get_index(node))

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

    @staticmethod
    def add_stmt_tracker(node: ast.stmt) -> ast.With:
        index_node = ast.Constant(value=get_index(node))

        tracker_call = ast.Call(
            func=ast.Name(id=IDENT.TRACKER_STMT, ctx=ast.Load()),
            args=[index_node],
            keywords=[],
        )

        return ast.With(items=[ast.withitem(context_expr=tracker_call)], body=[node])

    @staticmethod
    def add_frame_tracker(index: int, body: list[ast.stmt]) -> list[ast.stmt]:
        index_node = ast.Constant(value=index)

        tracker_call = ast.Call(
            func=ast.Name(id=IDENT.TRACKER_FRAME, ctx=ast.Load()),
            args=[index_node],
            keywords=[],
        )

        return [ast.With(items=[ast.withitem(context_expr=tracker_call)], body=body)]

    NodeType = TypeVar("NodeType", bound=ast.AST)

    def visit(self, node: NodeType) -> NodeType:
        match node:
            case ast.Module():
                node.body = list(map(self.visit, node.body))
                node.body = self.add_frame_tracker(get_index(node), node.body)
                return node

            case ast.Name(ctx=ast.Del()) | ast.Name(ctx=ast.Store()):
                pass

            case ast.Tuple(ctx=ast.Store()):
                pass

            case ast.JoinedStr():
                for value in node.values:
                    if isinstance(value, ast.FormattedValue):
                        self.generic_visit(value)

            case ast.expr():
                self.generic_visit(node)
                return self.add_expr_tracker(node)

            case ast.FunctionDef():
                node.body = list(map(self.visit, node.body))
                node.body = self.add_frame_tracker(get_index(node), node.body)
                return self.add_stmt_tracker(node)

            case ast.stmt():
                self.generic_visit(node)
                return self.add_stmt_tracker(node)

            case _:
                self.generic_visit(node)

        return node

    def attach(self, tree: ast.Module) -> ast.Module:
        return ast.fix_missing_locations(self.visit(tree))
