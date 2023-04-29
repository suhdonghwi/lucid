from types import FrameType
from typing import Tuple


class TrackData:
    def __init__(
        self,
        frame: FrameType,
        value: object,
        line_range: Tuple[int, int],
        col_range: Tuple[int, int],
    ):
        self.frame = frame
        self.value = value
        self.line_range = line_range
        self.col_range = col_range

    def dump(self):
        print(self.frame)
        print("Eval result:", self.value)
        print("Pos:", self.line_range, self.col_range)
