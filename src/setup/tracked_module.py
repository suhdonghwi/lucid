import sys
import ast
from types import FrameType

import tracker_identifier as IDENT
from tracker_attacher import TrackerAttacher

IS_PYODIDE = "pyodide" in sys.modules

if IS_PYODIDE:
    import js_callbacks
    from util import js_object, js_range_object


FrameNode = ast.FunctionDef | ast.Lambda | ast.Module


# TODO: rename into more intuitive one
class FrameInfo:
    def __init__(self, frame: FrameType):
        self.frame = frame
        self.stack: list[ast.expr | ast.stmt] = []

    def push(self, node: ast.expr | ast.stmt):
        self.stack.append(node)

    def pop(self) -> ast.expr | ast.stmt:
        return self.stack.pop()

    def top(self) -> ast.expr | ast.stmt:
        return self.stack[-1]


class FrameContext:
    def __init__(self, node: FrameNode, frame_info_stack: list[FrameInfo]):
        self.node = node
        self.frame_info_stack = frame_info_stack

    def __enter__(self):
        frame = sys._getframe(1)
        frame_info = FrameInfo(frame)
        self.frame_info_stack.append(frame_info)

        if IS_PYODIDE:
            if not isinstance(self.node, ast.FunctionDef):
                return

            caller_frame = self.frame_info_stack[-2]
            js_callbacks.frame_enter(
                js_object(
                    codeObjectId=id(frame.f_code),
                    framePosRange=js_range_object(self.node),
                    callerPosRange=js_range_object(caller_frame.top()),
                )
            )

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        self.frame_info_stack.pop()


class StmtContext:
    def __init__(self, node: ast.stmt, frame_info: FrameInfo):
        self.node = node
        self.frame_info = frame_info

    def __enter__(self):
        self.frame_info.push(self.node)

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        popped = self.frame_info.pop()
        assert self.node == popped

        if IS_PYODIDE:
            js_callbacks.stmt_exit(js_range_object(self.node))


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
            node: ast.expr = self.tree_nodes[node_index]
            frame_info_stack[-1].push(node)
            return node_index

        def track_after_expr(_: int, value: object):
            frame_info_stack[-1].pop()
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
