import ast
import sys

from . import identifiers
from .node_index import set_index
from .attacher import TrackerAttacher
from .callback import TrackerCallbacks
from .eval_context import EvalContext


def linearize_ast(tree: ast.AST):
    linearized: list[ast.AST] = []

    for node in ast.walk(tree):
        set_index(node, len(linearized))
        linearized.append(node)

    return linearized


def execute(code: str, file_name: str, callbacks: TrackerCallbacks):
    raw_ast = ast.parse(code, file_name)
    linearized_ast = linearize_ast(raw_ast)
    tracked_ast = TrackerAttacher().attach(raw_ast)

    compiled_code = compile(tracked_ast, filename=file_name, mode="exec")

    def tracker_before_expr(node_index: int):
        frame = sys._getframe(1)
        node = linearized_ast[node_index]
        assert isinstance(node, ast.expr)

        callbacks.before_expr(frame, node)
        return node_index

    def tracker_after_expr(node_index: int, value: object):
        frame = sys._getframe(1)
        node = linearized_ast[node_index]
        assert isinstance(node, ast.expr)

        callbacks.after_expr(frame, node, value)
        return value

    def tracker_stmt(node_index: int):
        node = linearized_ast[node_index]
        assert isinstance(node, ast.stmt)

        return EvalContext(node, callbacks.before_stmt, callbacks.after_stmt)

    # TODO: Handle lambda expression
    def tracker_frame(node_index: int):
        node = linearized_ast[node_index]
        assert isinstance(node, (ast.FunctionDef, ast.Lambda, ast.Module))

        return EvalContext(node, callbacks.before_frame, callbacks.after_frame)

    tracker_mappings = {
        identifiers.TRACKER_BEFORE_EXPR: tracker_before_expr,
        identifiers.TRACKER_AFTER_EXPR: tracker_after_expr,
        identifiers.TRACKER_STMT: tracker_stmt,
        identifiers.TRACKER_FRAME: tracker_frame,
    }

    exec(compiled_code, tracker_mappings)
