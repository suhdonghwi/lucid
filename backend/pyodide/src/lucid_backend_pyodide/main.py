import ast
from types import FrameType

from custom_loader_path_finder import (
    CustomLoaderPathFinder,
    install_path_finder,
)

import tracking
from tracking.callback import FrameNode
from tracking.loader import TrackingLoader


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
    tracking_loader = TrackingLoader(tracker_callbacks)
    tracking_path_finder = CustomLoaderPathFinder(tracking_loader)
    install_path_finder(tracking_path_finder)
