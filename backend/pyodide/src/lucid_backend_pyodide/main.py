import ast
from types import TracebackType, FrameType

from . import tracking
from .tracking.callback import FrameNode
from .util import js_object


def before_expr(frame: FrameType, node: ast.expr):
    pass


def after_expr(frame: FrameType, node: ast.expr, value: object):
    pass


def before_stmt(frame: FrameType, node: ast.stmt):
    pass


def after_stmt(frame: FrameType, node: ast.stmt):
    pass


def before_frame(frame: FrameType, node: FrameNode):
    print("Enter frame")
    pass


def after_frame(frame: FrameType, node: FrameNode):
    print("Exit frame")
    pass


tracker_callbacks = tracking.TrackerCallbacks(
    before_expr=before_expr,
    after_expr=after_expr,
    before_stmt=before_stmt,
    after_stmt=after_stmt,
    before_frame=before_frame,
    after_frame=after_frame,
)


def execute(code: str):
    file_name = "<code>"

    try:
        tracking.execute(code, file_name, tracker_callbacks)
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
