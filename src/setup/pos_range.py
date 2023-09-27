class PosRange:
    def __init__(
        self,
        lineno: int,
        end_lineno: int | None,
        col: int | None,
        end_col: int | None,
    ) -> None:
        self.lineno = lineno
        self.end_lineno = end_lineno

        self.col = col
        self.end_col = end_col
