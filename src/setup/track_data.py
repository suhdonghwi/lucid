from types import FrameType


class TrackData:
    def __init__(
        self,
        frame: FrameType,
        value: object,
        line: int,
        end_line: int,
        col: int,
        end_col: int
    ):
        self.frame = frame
        self.value = value

        self.line = line
        self.end_line = end_line

        self.col = col
        self.end_col = end_col

    def dump(self):
        print(self.frame)
        print("Eval result:", self.value)
        print("Pos:", self.line, self.end_line, self.col, self.end_col)
