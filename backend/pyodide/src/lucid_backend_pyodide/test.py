import ast

from types import FrameType

import tracking
from tracking.callback import FrameNode


test_code = """
import hello
hello.a = 10
"""


def before_expr(frame: FrameType, node: ast.expr):
    pass


def after_expr(frame: FrameType, node: ast.expr, value: object):
    pass


def before_stmt(frame: FrameType, node: ast.stmt):
    pass


def after_stmt(frame: FrameType, node: ast.stmt):
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

raw_ast = ast.parse(test_code, "<code>")
print(ast.dump(raw_ast, indent=2))

attacher = tracking.TrackerAttacher(raw_ast)
attached_ast = attacher.attach()

print()
print(ast.dump(attached_ast, indent=2))
print()
print(ast.unparse(attached_ast))
