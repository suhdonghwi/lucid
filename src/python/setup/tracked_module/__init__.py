import ast

import tracker_identifier as IDENT
from tracker_attacher import TrackerAttacher

from .frame_context import FrameContext, FrameNode
from .stmt_context import StmtContext


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
