from types import TracebackType
from tracked_module import TrackedModule


class RunError:
    def __init__(
        self,
        message: str,
        lineno: int,
        end_lineno: int | None,
        col: int | None,
        end_col: int | None,
    ) -> None:
        self.message = message

        self.lineno = lineno
        self.end_lineno = end_lineno

        self.col = col
        self.end_col = end_col


def run(code: str):
    file_name = "<code>"

    try:
        module = TrackedModule(code, file_name)
        module.exec()
    except SyntaxError as e:
        message = "SyntaxError: " + e.msg

        assert isinstance(e.lineno, int)
        assert isinstance(e.offset, int)

        return RunError(message, e.lineno, e.end_lineno, e.offset, e.end_offset)
    except Exception as e:
        tb = e.__traceback__.tb_next.tb_next  # type: ignore
        while (
            tb is not None
            and tb.tb_next is not None
            and tb.tb_frame.f_code.co_filename == file_name
        ):
            tb = tb.tb_next

        assert isinstance(tb, TracebackType)

        message = f"${type(e).__name__}: ${e}"
        return RunError(message, tb.tb_lineno, None, None, None)
