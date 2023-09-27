from types import TracebackType
from pos_range import PosRange
from tracked_module import TrackedModule


class RunError:
    def __init__(
        self,
        range: PosRange,
        message: str,
    ) -> None:
        self.range = range
        self.message = message


def run(code: str):
    file_name = "<code>"

    try:
        module = TrackedModule(code, file_name)
        module.exec()
    except SyntaxError as e:
        assert isinstance(e.lineno, int)

        error_range = PosRange(e.lineno, e.end_lineno, e.offset, e.end_offset)
        message = "SyntaxError: " + e.msg

        return RunError(error_range, message)
    except Exception as e:
        tb = e.__traceback__.tb_next.tb_next  # type: ignore
        while (
            tb is not None
            and tb.tb_next is not None
            and tb.tb_frame.f_code.co_filename == file_name
        ):
            tb = tb.tb_next

        assert isinstance(tb, TracebackType)

        error_range = PosRange(tb.tb_lineno, None, None, None)
        message = f"${type(e).__name__}: ${e}"
        return RunError(error_range, message)
