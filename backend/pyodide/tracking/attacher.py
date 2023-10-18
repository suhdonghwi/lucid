import ast
import sys
from typing import TypeVar

from . import identifiers
from .callback import TrackerCallbacks
from .eval_context import EvalContext
from .linearized_ast import LinearizedAST


class TrackerAttacher(ast.NodeTransformer):
    def __init__(self, raw_ast: ast.Module):
        self.raw_ast = raw_ast
        self.linearized_ast = LinearizedAST(raw_ast)

    def create_index_node(self, node: ast.AST) -> ast.Constant:
        index = self.linearized_ast.index_of(node)
        index_node = ast.Constant(value=index)
        return index_node

    @staticmethod
    def create_call_node(func_name: str, args: list[ast.expr]) -> ast.Call:
        return ast.Call(
            func=ast.Name(id=func_name, ctx=ast.Load()),
            args=args,
            keywords=[],
        )

    def add_expr_tracker(self, node: ast.expr) -> ast.Call:
        index_node = self.create_index_node(node)

        before_call = self.create_call_node(
            identifiers.TRACKER_BEFORE_EXPR, [index_node]
        )
        after_call = self.create_call_node(
            identifiers.TRACKER_AFTER_EXPR, [before_call, node]
        )

        return after_call

    def add_stmt_tracker(self, node: ast.stmt) -> ast.With:
        index_node = self.create_index_node(node)
        tracker_call = self.create_call_node(identifiers.TRACKER_STMT, [index_node])

        return ast.With(items=[ast.withitem(context_expr=tracker_call)], body=[node])

    def add_frame_tracker(self, node: ast.FunctionDef | ast.Module) -> list[ast.stmt]:
        index_node = self.create_index_node(node)
        tracker_call = self.create_call_node(identifiers.TRACKER_FRAME, [index_node])

        return [
            ast.With(items=[ast.withitem(context_expr=tracker_call)], body=node.body)
        ]

    Node = TypeVar("Node", bound=ast.AST)

    def visit(self, node: Node) -> Node:
        match node:
            case ast.Module():
                node.body = list(map(self.visit, node.body))
                node.body = self.add_frame_tracker(node)
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
                node.body = self.add_frame_tracker(node)
                return self.add_stmt_tracker(node)

            case ast.stmt():
                self.generic_visit(node)
                return self.add_stmt_tracker(node)

            case _:
                self.generic_visit(node)

        return node

    def attach(self) -> ast.Module:
        return ast.fix_missing_locations(self.visit(self.raw_ast))

    def create_tracker_mappings(self, callbacks: TrackerCallbacks):
        def tracker_before_expr(node_index: int):
            frame = sys._getframe(1)
            node = self.linearized_ast[node_index]
            assert isinstance(node, ast.expr)

            callbacks.before_expr(frame, node)
            return node_index

        def tracker_after_expr(node_index: int, value: object):
            frame = sys._getframe(1)
            node = self.linearized_ast[node_index]
            assert isinstance(node, ast.expr)

            callbacks.after_expr(frame, node, value)
            return value

        def tracker_stmt(node_index: int):
            node = self.linearized_ast[node_index]
            assert isinstance(node, ast.stmt)

            return EvalContext(node, callbacks.before_stmt, callbacks.after_stmt)

        # TODO: Handle lambda expression
        def tracker_frame(node_index: int):
            node = self.linearized_ast[node_index]
            assert isinstance(node, (ast.FunctionDef, ast.Lambda, ast.Module))

            return EvalContext(node, callbacks.before_frame, callbacks.after_frame)

        return {
            identifiers.TRACKER_BEFORE_EXPR: tracker_before_expr,
            identifiers.TRACKER_AFTER_EXPR: tracker_after_expr,
            identifiers.TRACKER_STMT: tracker_stmt,
            identifiers.TRACKER_FRAME: tracker_frame,
        }
