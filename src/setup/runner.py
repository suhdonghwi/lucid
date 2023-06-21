import ast

from tracker_attacher import TrackerAttacher


class RunError:
    def __init__(
        self,
        message: str,
        line: int | None,
        end_line: int | None,
        offset: int | None,
        end_offset: int | None,
    ) -> None:
        self.message = message

        self.line = line
        self.end_line = end_line

        self.offset = offset
        self.end_offset = end_offset


def run(code: str):
    file_name = "<code>"

    try:
        tree = ast.parse(code)
        attacher = TrackerAttacher("_track")

        attached_tree = attacher.attach(tree)
        exec_result = attached_tree.exec(file_name)
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
        return RunError(message, tb.tb_lineno, tb.tb_lineno, None, None)  # type: ignore

    return list(exec_result)
