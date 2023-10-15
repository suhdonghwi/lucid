from types import TracebackType

import tracking
from util import js_object


def run(code: str):
    file_name = "<code>"

    try:
        pass
    except SyntaxError as e:
        assert isinstance(e.lineno, int)

        error_range = js_object(
            lineno=e.lineno, endLineno=e.end_lineno, col=e.offset, endCol=e.end_offset
        )
        message = "SyntaxError: " + e.msg

        return js_object(range=error_range, message=message)
    except BaseException as e:
        if hasattr(e, "name") and e.name == "InterruptError":
            return None

        tb = e.__traceback__.tb_next.tb_next  # type: ignore
        while (
            tb is not None
            and tb.tb_next is not None
            and tb.tb_frame.f_code.co_filename == file_name
        ):
            tb = tb.tb_next

        assert isinstance(tb, TracebackType)

        error_range = js_object(lineno=tb.tb_lineno, endLineno=tb.tb_lineno)
        message = f"{type(e).__name__}: {e}"
        return js_object(range=error_range, message=message)
