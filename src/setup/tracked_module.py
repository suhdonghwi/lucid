import sys
import ast
from types import FrameType

import tracker_identifier as IDENT
from tracker_attacher import TrackerAttacher

IS_PYODIDE = "pyodide" in sys.modules

if IS_PYODIDE:
    import js_callbacks
    from util import js_object


FrameNode = ast.FunctionDef | ast.Lambda | ast.Module


class FrameInfo:
    def __init__(self, frame: FrameType):
        self.frame = frame
        self.expr_stack: list[ast.expr] = []
        self.stmt_stack: list[ast.stmt] = []

    def push_stmt(self, node: ast.stmt):
        self.stmt_stack.append(node)

    def pop_stmt(self):
        return self.stmt_stack.pop()


class FrameContext:
    def __init__(self, node: FrameNode, frame_info_stack: list[FrameInfo]):
        self.node = node
        self.frame_info_stack = frame_info_stack

    def __enter__(self):
        frame = sys._getframe(1)
        frame_info = FrameInfo(frame)
        self.frame_info_stack.append(frame_info)

    def __exit__(self, _1, _2, _3):
        self.frame_info_stack.pop()


class StmtContext:
    def __init__(self, node: ast.stmt, frame_info: FrameInfo):
        self.node = node
        self.frame_info = frame_info

    def __enter__(self):
        self.frame_info.push_stmt(self.node)

    def __exit__(self, exc_type, exc_value, exc_tb):
        print(exc_type)
        if isinstance(exc_value, KeyboardInterrupt):
            return False

        popped = self.frame_info.pop_stmt()
        assert self.node == popped

        if IS_PYODIDE:
            js_callbacks.callbacks.after_stmt(
                js_object(
                    lineno=self.node.lineno,
                    endLineno=self.node.end_lineno,
                    col=self.node.col_offset,
                    endCol=self.node.end_col_offset,
                )
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
        frame_info_stack: list[FrameInfo] = []

        def track_before_expr(node_index: int):
            # print(self.tree_nodes[node_index])
            return node_index

        def track_after_expr(node_index: int, value: object):
            return value

        def track_stmt(node_index: int):
            node: ast.stmt = self.tree_nodes[node_index]
            return StmtContext(node, frame_info_stack[-1])

        # TODO: Handle lambda expression
        def track_frame(node_index: int):
            node: FrameNode = self.tree_nodes[node_index]
            return FrameContext(node, frame_info_stack)

        namespace = {
            IDENT.TRACKER_BEFORE_EXPR: track_before_expr,
            IDENT.TRACKER_AFTER_EXPR: track_after_expr,
            IDENT.TRACKER_STMT: track_stmt,
            IDENT.TRACKER_FRAME: track_frame,
        }
        exec(self.compiled_code, namespace)

    def unparse(self) -> str:
        return ast.unparse(self.tracked_tree)
