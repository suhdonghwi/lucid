import ast
import sys
from typing import Tuple

from track_data import TrackData


class AttachedTree:
    def __init__(self, attached_tree: ast.Module, tracker_identifier: str):
        self.attached_tree = attached_tree
        self.tracker_identifer = tracker_identifier

    def exec(self):
        tracking_result: list[TrackData] = []

        def track_expression(
            value: object,
            line_range: Tuple[int, int],
            col_range: Tuple[int, int],
        ):
            frame = sys._getframe(1)
            track_data = TrackData(frame, value, line_range, col_range)
            tracking_result.append(track_data)

            return value

        compiled_code = compile(self.attached_tree, filename="<code>", mode="exec")
        namespace = {
            self.tracker_identifer: track_expression,
        }
        exec(compiled_code, namespace)

        return tracking_result

    def unparse(self) -> str:
        return ast.unparse(self.attached_tree)
