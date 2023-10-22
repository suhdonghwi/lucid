import ast

from types import FrameType
from typing import Callable, Concatenate, NamedTuple, ParamSpec

FrameNode = ast.FunctionDef | ast.Lambda | ast.Module

Params = ParamSpec("Params")
CallbackType = Callable[Concatenate[FrameType, Params], None]


class TrackerCallbacks(NamedTuple):
    before_expr: CallbackType[[ast.expr]]
    after_expr: CallbackType[[ast.expr, object]]

    before_stmt: CallbackType[[ast.stmt]]
    after_stmt: CallbackType[[ast.stmt]]

    before_frame: CallbackType[[FrameNode]]
    after_frame: CallbackType[[FrameNode]]