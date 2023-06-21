from types import FrameType


class TrackData:
    def __init__(
        self,
        value: object,
        line: int,
        end_line: int,
        col: int,
        end_col: int,
        frame: FrameType,
    ):
        self.value = value

        self.line = line
        self.end_line = end_line

        self.col = col
        self.end_col = end_col

        self.frame_id = id(frame)
        first_line, *_, last_line = frame.f_code.co_lines()
        self.code_obj_line = first_line[2]
        self.code_obj_end_line = last_line[2]

    def dump(self):
        print("Eval result:", self.value)
        print("Pos:", self.line, self.end_line, self.col, self.end_col)
