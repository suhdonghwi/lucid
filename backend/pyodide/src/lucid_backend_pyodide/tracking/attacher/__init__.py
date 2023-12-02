import ast
import sys
from typing import TypeVar

from . import identifier
from ..callback import TrackerCallbacks
from ..eval_context import EvalContext
from .indexed_ast import IndexedAST, NodeIndex
from .node_util import (
    make_tracked_expr,
    make_tracked_stmt,
    make_tracked_frame,
)


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
                node.body = [make_tracked_frame(node, index)]
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
                return make_tracked_expr(node, index)

            case ast.FunctionDef():
                node.body = list(map(self.visit, node.body))
                node.body = [make_tracked_frame(node, index)]
                return make_tracked_stmt(node, index)

            case ast.stmt():
                self.generic_visit(node)
                return make_tracked_stmt(node, index)

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
