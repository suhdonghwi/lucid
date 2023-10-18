import sys
import ast

from .callback import CallbackType


class EvalContext[Node: ast.AST]:
    def __init__(
        self,
        node: Node,
        before_callback: CallbackType[Node],
        after_callback: CallbackType[Node],
    ):
        self.node = node

        self.before_callback = before_callback
        self.after_callback = after_callback

    def __enter__(self):
        self.frame = sys._getframe(1)
        self.before_callback(self.frame, self.node)

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        self.after_callback(self.frame, self.node)
