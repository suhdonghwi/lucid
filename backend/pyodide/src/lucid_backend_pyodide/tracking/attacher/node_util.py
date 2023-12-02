import ast

from . import identifier
from .indexed_ast import NodeIndex


def make_index_node(index: NodeIndex) -> ast.Constant:
    index_node = ast.Constant(value=index)
    return index_node


def make_call_node(func_name: str, args: list[ast.expr]) -> ast.Call:
    return ast.Call(
        func=ast.Name(id=func_name, ctx=ast.Load()),
        args=args,
        keywords=[],
    )


def make_tracked_expr(node: ast.expr, index: NodeIndex) -> ast.Call:
    index_node = make_index_node(index)

    before_call = make_call_node(identifier.TRACKER_BEFORE_EXPR, [index_node])
    after_call = make_call_node(identifier.TRACKER_AFTER_EXPR, [before_call, node])

    return after_call


def make_tracked_stmt(node: ast.stmt, index: NodeIndex) -> ast.With:
    index_node = make_index_node(index)
    tracker_call = make_call_node(identifier.TRACKER_STMT, [index_node])

    return ast.With(items=[ast.withitem(context_expr=tracker_call)], body=[node])


def make_tracked_frame(
    node: ast.FunctionDef | ast.Module, index: NodeIndex
) -> ast.stmt:
    index_node = make_index_node(index)
    tracker_call = make_call_node(identifier.TRACKER_FRAME, [index_node])

    return ast.With(items=[ast.withitem(context_expr=tracker_call)], body=node.body)
