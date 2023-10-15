import ast

from types import FrameType

import tracking
from tracking.callback import FrameNode


test_code = """
a, b = 1, 2
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
tracking.execute(test_code, "<code>", tracker_callbacks)

# print("[AST Dump]")
# print(ast.dump(test_module.raw_tree, indent=2))
#
# print()
# print("[Unparse result]")
#
# print(test_module.unparse())
#
#
# print()
# print("[Exec result]")
#
# result = test_module.execute()
#
# print()
# print("[Track result]")
# print(result)
