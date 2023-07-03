import ast

from types import FrameType


class TrackData:
    def __init__(
        self,
        value: object,
        node: ast.AST,
        frame: FrameType,
    ):
        self.value = value

        self.line = node.lineno
        self.end_line = node.end_lineno
        self.col = node.col_offset
        self.end_col = node.end_col_offset

        self.frame_id = id(frame)
        first_line, *_, last_line = frame.f_code.co_lines()
        self.code_obj_line = first_line[2]
        self.code_obj_end_line = last_line[2]

    def dump(self):
        print("Eval result:", self.value)
        print("Pos:", self.line, self.end_line, self.col, self.end_col)
