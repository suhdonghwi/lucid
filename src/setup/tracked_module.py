import ast
import sys
import copy
from types import FrameType

import tracker_identifier as IDENT

from tracker_attacher import TrackerAttacher


class ExprLog:
    def __init__(self, node: ast.expr, value: object):
        self.node = node
        self.value = value


class StmtLog:
    def __init__(self, node: ast.stmt):
        self.node = node
        self.expr_stack: list[ast.expr] = []
        self.log: list["ExprLog | FrameLog"] = []

    def push_expr(self, node: ast.expr):
        self.expr_stack.append(node)

    def pop_expr(self, value: object):
        node = self.expr_stack.pop()
        self.log.append(ExprLog(node, copy.deepcopy(value)))
        # self.log.append(ExprLog(node, value))

    def append_frame_log(self, frame_log: "FrameLog"):
        self.log.append(frame_log)


class FrameLog:
    def __init__(self, frame: FrameType, origin: ast.AST | None):
        self.frame = frame
        self.log: list[StmtLog] = []
        self.origin = origin

    def push_expr(self, node: ast.expr):
        assert len(self.log) != 0
        self.log[-1].push_expr(node)

    def pop_expr(self, value: object):
        assert len(self.log) != 0
        self.log[-1].pop_expr(value)

    def append_stmt_log(self, stmt_log: StmtLog):
        self.log.append(stmt_log)

    def append_frame_log(self, frame_log: "FrameLog"):
        assert len(self.log) != 0
        self.log[-1].append_frame_log(frame_log)

    def last_node(self) -> ast.expr | ast.stmt:
        if len(self.log) == 0:
            raise RuntimeError()

        last_stmt = self.log[-1]
        if len(last_stmt.expr_stack) == 0:
            return last_stmt.node
        else:
            return last_stmt.expr_stack[-1]


class StmtContext:
    def __init__(self, node: ast.stmt, frame_stack: list[FrameLog]):
        self.node = node
        self.frame_stack = frame_stack

    def __enter__(self):
        current_frame = sys._getframe(1)
        last_frame_log = self.frame_stack[-1]

        if current_frame != last_frame_log.frame:
            new_frame_log = FrameLog(current_frame, last_frame_log.last_node())
            self.frame_stack.append(new_frame_log)

        stmt_log = StmtLog(self.node)
        self.frame_stack[-1].append_stmt_log(stmt_log)

    def __exit__(self, _1, _2, _3):
        current_frame = sys._getframe(1)
        last_frame_log = self.frame_stack[-1]

        if current_frame != last_frame_log.frame:
            # TODO
            popped = self.frame_stack.pop()
            self.frame_stack[-1].append_frame_log(popped)


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
        frame_stack: list[FrameLog] = []

        def track_before_expr(node_index: int):
            assert len(frame_stack) != 0

            expr: ast.expr = self.tree_nodes[node_index]
            frame_stack[-1].push_expr(expr)

            return node_index

        def track_after_expr(node_index: int, value: object):
            current_frame = sys._getframe(1)
            last_frame_log = frame_stack[-1]

            if current_frame != last_frame_log.frame:
                popped = frame_stack.pop()
                frame_stack[-1].append_frame_log(popped)

            frame_stack[-1].pop_expr(value)
            return value

        def track_stmt(node_index: int):
            nonlocal frame_stack

            if len(frame_stack) == 0:
                root_frame_log = FrameLog(sys._getframe(1), None)
                frame_stack.append(root_frame_log)

            node: ast.stmt = self.tree_nodes[node_index]
            return StmtContext(node, frame_stack)

        namespace = {
            IDENT.TRACKER_BEFORE_EXPR: track_before_expr,
            IDENT.TRACKER_AFTER_EXPR: track_after_expr,
            IDENT.TRACKER_STMT: track_stmt,
        }
        exec(self.compiled_code, namespace)

        return frame_stack[-1]

    def unparse(self) -> str:
        return ast.unparse(self.tracked_tree)
