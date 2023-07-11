import ast

from tracked_module import TrackedModule


class RunError:
    def __init__(
        self,
        message: str,
        line: int | None,
        end_line: int | None,
        col: int | None,
        end_col: int | None,
    ) -> None:
        self.message = message

        self.line = line
        self.end_line = end_line

        self.col = col
        self.end_col = end_col


def run(code: str):
    file_name = "<code>"

    try:
        module = TrackedModule(code, file_name)
        exec_result = module.exec()
    except SyntaxError as e:
        message = "SyntaxError: " + e.msg
        return RunError(message, e.lineno, e.end_lineno, e.offset, e.end_offset)
    except Exception as e:
        tb = e.__traceback__.tb_next.tb_next  # type: ignore
        while (
            tb is not None
            and tb.tb_next is not None
            and tb.tb_frame.f_code.co_filename == file_name
        ):
            tb = tb.tb_next

        message = type(e).__name__ + ": " + str(e)
        print(message)
        return RunError(message, tb.tb_lineno, tb.tb_lineno, None, None)  # type: ignore

    return exec_result
