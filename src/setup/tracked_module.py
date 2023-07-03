import ast
import sys

from track_data import TrackData
import tracker_identifier as IDENT

from tracker_attacher import TrackerAttacher


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
        tracking_result: list[TrackData] = []

        def track_before_expr(node_index: int):
            return node_index

        def track_after_expr(node_index: int, value: object):
            frame = sys._getframe(1)
            track_data = TrackData(value, self.tree_nodes[node_index], frame)
            tracking_result.append(track_data)

            return value

        namespace = {
            IDENT.TRACKER_BEFORE_EXPR: track_before_expr,
            IDENT.TRACKER_AFTER_EXPR: track_after_expr,
        }
        exec(self.compiled_code, namespace)

        return tracking_result

    def unparse(self) -> str:
        return ast.unparse(self.tracked_tree)

