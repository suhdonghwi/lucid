import ast
import sys

from track_data import TrackData


class AttachedTree:
    def __init__(self, attached_tree: ast.Module, tracker_identifier: str):
        self.attached_tree = attached_tree
        self.tracker_identifer = tracker_identifier

    def exec(self, file_name: str):
        tracking_result: list[TrackData] = []

        def track_expression(
            value: object, line: int, end_line: int, col: int, end_col: int
        ):
            frame = sys._getframe(1)
            track_data = TrackData(value, line, end_line, col, end_col, frame.f_code)
            tracking_result.append(track_data)

            return value

        compiled_code = compile(self.attached_tree, filename=file_name, mode="exec")
        namespace = {
            self.tracker_identifer: track_expression,
        }
        exec(compiled_code, namespace)

        return tracking_result

    def unparse(self) -> str:
        return ast.unparse(self.attached_tree)
