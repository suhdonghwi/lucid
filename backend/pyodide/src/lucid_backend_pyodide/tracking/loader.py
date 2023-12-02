from importlib.abc import Loader
from importlib.machinery import ModuleSpec

import ast

from types import ModuleType, FrameType

import tracking
from tracking.callback import FrameNode
from tracking.attacher import TrackerAttacher


def before_expr(frame: FrameType, node: ast.expr):
    pass


def after_expr(frame: FrameType, node: ast.expr, value: object):
    pass


def before_stmt(frame: FrameType, node: ast.stmt):
    print("before_stmt")
    pass


def after_stmt(frame: FrameType, node: ast.stmt):
    print("after")
    pass


def before_frame(frame: FrameType, node: FrameNode):
    pass


def after_frame(frame: FrameType, node: FrameNode):
    pass


tracker_callbacks = tracking.TrackerCallbacks(
    before_expr=before_expr,
    after_expr=after_expr,
    before_stmt=before_stmt,
    after_stmt=after_stmt,
    before_frame=before_frame,
    after_frame=after_frame,
)


class TrackingLoader(Loader):
    def __init__(self, filename: str):
        self.filename = filename

    def create_module(self, spec: ModuleSpec):
        return None  # use default module creation semantics

    def exec_module(self, module: ModuleType):
        with open(self.filename) as file:
            source = file.read()

        raw_ast = ast.parse(source, self.filename)

        attacher = TrackerAttacher(raw_ast)
        tracked_ast = attacher.attach()

        compiled_code = compile(tracked_ast, filename=self.filename, mode="exec")

        exec(compiled_code, vars(module))
