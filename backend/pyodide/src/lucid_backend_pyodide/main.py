import ast
from types import FrameType

from .custom_loader_path_finder import (
    CustomLoaderPathFinder,
    install_path_finder,
)

from . import tracking
from .tracking.callback import FrameNode
from .tracking.loader import create_tracking_loader_class


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


def execute(code: str, filename: str):
    TrackingLoader = create_tracking_loader_class(tracker_callbacks)
    tracking_path_finder = CustomLoaderPathFinder(TrackingLoader)

    install_path_finder(tracking_path_finder)

    compiled_code, tracker_mappings = tracking.tracked_compile(
        code, filename, tracker_callbacks
    )

    exec(compiled_code, tracker_mappings)
