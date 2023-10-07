import sys
import ast

import tracker_identifier as IDENT
from tracker_attacher import TrackerAttacher

IS_PYODIDE = "pyodide" in sys.modules

if IS_PYODIDE:
    import js_callbacks
    from util import js_object, js_range_object


FrameNode = ast.FunctionDef | ast.Lambda | ast.Module


class FrameContext:
    def __init__(self, node: FrameNode):
        self.node = node

    def __enter__(self):
        self.frame = sys._getframe(1)

        if IS_PYODIDE:
            match self.node:
                case ast.FunctionDef():
                    pos_range = js_range_object(self.node)
                case _:
                    return

            js_callbacks.frame_enter(
                js_object(
                    id=id(self.frame),
                    codeObjectId=id(self.frame.f_code),
                    posRange=pos_range,
                )
            )

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        if IS_PYODIDE:
            match self.node:
                case ast.FunctionDef():
                    pos_range = js_range_object(self.node)
                case _:
                    return

            js_callbacks.frame_exit(
                js_object(
                    id=id(self.frame),
                    codeObjectId=id(self.frame.f_code),
                    posRange=pos_range,
                )
            )


class StmtContext:
    def __init__(self, node: ast.stmt):
        self.node = node

    def __enter__(self):
        self.frame = sys._getframe(1)

        if IS_PYODIDE:
            js_callbacks.stmt_enter(
                frameId=id(self.frame), posRange=js_range_object(self.node)
            )

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        if IS_PYODIDE:
            js_callbacks.stmt_exit(
                frameId=id(self.frame), posRange=js_range_object(self.node)
            )


class TrackedModule:
    def __init__(self, source: str, file_name: str):
        self.file_name = file_name
        self.original_tree = ast.parse(source, file_name)

        self.tree_nodes: list[ast.AST] = []
        for node in ast.walk(self.original_tree):
            node._index = len(self.tree_nodes)
            self.tree_nodes.append(node)

        self.tracked_tree = TrackerAttacher().attach(self.original_tree)
        self.compiled_code = compile(
            self.tracked_tree, filename=self.file_name, mode="exec"
        )

    def exec(self):
        def track_before_expr(node_index: int):
            node: ast.expr = self.tree_nodes[node_index]
            return node_index

        def track_after_expr(node_index: int, value: object):
            return value

        def track_stmt(node_index: int):
            node: ast.stmt = self.tree_nodes[node_index]
            return StmtContext(node)

        # TODO: Handle lambda expression
        def track_frame(node_index: int):
            node: FrameNode = self.tree_nodes[node_index]
            return FrameContext(node)

        namespace = {
            IDENT.TRACKER_BEFORE_EXPR: track_before_expr,
            IDENT.TRACKER_AFTER_EXPR: track_after_expr,
            IDENT.TRACKER_STMT: track_stmt,
            IDENT.TRACKER_FRAME: track_frame,
        }
        exec(self.compiled_code, namespace)

    def unparse(self) -> str:
        return ast.unparse(self.tracked_tree)
