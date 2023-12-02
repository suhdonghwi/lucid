import ast
import sys
from typing import TypeVar

from . import identifier
from ..callback import TrackerCallbacks
from ..eval_context import EvalContext
from .indexed_ast import IndexedAST, NodeIndex


def create_index_node(index: NodeIndex) -> ast.Constant:
    index_node = ast.Constant(value=index)
    return index_node


def create_call_node(func_name: str, args: list[ast.expr]) -> ast.Call:
    return ast.Call(
        func=ast.Name(id=func_name, ctx=ast.Load()),
        args=args,
        keywords=[],
    )


def add_expr_tracker(node: ast.expr, index: NodeIndex) -> ast.Call:
    index_node = create_index_node(index)

    before_call = create_call_node(identifier.TRACKER_BEFORE_EXPR, [index_node])
    after_call = create_call_node(identifier.TRACKER_AFTER_EXPR, [before_call, node])

    return after_call


def add_stmt_tracker(node: ast.stmt, index: NodeIndex) -> ast.With:
    index_node = create_index_node(index)
    tracker_call = create_call_node(identifier.TRACKER_STMT, [index_node])

    return ast.With(items=[ast.withitem(context_expr=tracker_call)], body=[node])


def add_frame_tracker(
    node: ast.FunctionDef | ast.Module, index: NodeIndex
) -> list[ast.stmt]:
    index_node = create_index_node(index)
    tracker_call = create_call_node(identifier.TRACKER_FRAME, [index_node])

    return [ast.With(items=[ast.withitem(context_expr=tracker_call)], body=node.body)]


class TrackerAttacher(ast.NodeTransformer):
    def __init__(self, raw_ast: ast.Module):
        self.raw_ast = raw_ast
        self.indexed_ast = IndexedAST(raw_ast)

    Node = TypeVar("Node", bound=ast.AST)

    def visit(self, node: Node) -> Node:
        index = self.indexed_ast.index_of(node)

        match node:
            case ast.Module():
                node.body = list(map(self.visit, node.body))
                node.body = add_frame_tracker(node, index)
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
                return add_expr_tracker(node, index)

            case ast.FunctionDef():
                node.body = list(map(self.visit, node.body))
                node.body = add_frame_tracker(node, index)
                return add_stmt_tracker(node, index)

            case ast.stmt():
                self.generic_visit(node)
                return add_stmt_tracker(node, index)

            case _:
                self.generic_visit(node)

        return node

    def attach(self) -> ast.Module:
        return ast.fix_missing_locations(self.visit(self.raw_ast))

    def create_tracker_mappings(self, callbacks: TrackerCallbacks):
        def tracker_before_expr(index: NodeIndex):
            frame = sys._getframe(1)
            node = self.indexed_ast.node_of(index)
            assert isinstance(node, ast.expr)

            callbacks.before_expr(frame, node)
            return index

        def tracker_after_expr(index: NodeIndex, value: object):
            frame = sys._getframe(1)
            node = self.indexed_ast.node_of(index)
            assert isinstance(node, ast.expr)

            callbacks.after_expr(frame, node, value)
            return value

        def tracker_stmt(index: NodeIndex):
            node = self.indexed_ast.node_of(index)
            assert isinstance(node, ast.stmt)

            return EvalContext(node, callbacks.before_stmt, callbacks.after_stmt)

        # TODO: Handle lambda expression
        def tracker_frame(index: NodeIndex):
            node = self.indexed_ast.node_of(index)
            assert isinstance(node, (ast.FunctionDef, ast.Lambda, ast.Module))

            return EvalContext(node, callbacks.before_frame, callbacks.after_frame)

        return {
            identifier.TRACKER_BEFORE_EXPR: tracker_before_expr,
            identifier.TRACKER_AFTER_EXPR: tracker_after_expr,
            identifier.TRACKER_STMT: tracker_stmt,
            identifier.TRACKER_FRAME: tracker_frame,
        }
