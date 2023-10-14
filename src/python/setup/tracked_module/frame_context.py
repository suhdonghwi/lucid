import sys
import ast

IS_PYODIDE = "pyodide" in sys.modules


if IS_PYODIDE:
    import callbacks  # type: ignore
    from util import js_object, js_range_object

FrameNode = ast.FunctionDef | ast.Lambda | ast.Module


class FrameContext:
    def __init__(self, node: FrameNode):
        self.node = node

    def __enter__(self):
        self.frame = sys._getframe(1)

        if IS_PYODIDE:
            match self.node:
                case ast.FunctionDef():
                    pos_range = js_range_object(self.node)
                case _:
                    return

            callbacks.onFrameEnter(
                js_object(
                    id=id(self.frame),
                    codeObjectId=id(self.frame.f_code),
                    posRange=pos_range,
                )
            )

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        if IS_PYODIDE:
            match self.node:
                case ast.FunctionDef():
                    pos_range = js_range_object(self.node)
                case _:
                    return

            callbacks.onFrameExit(
                js_object(
                    id=id(self.frame),
                    codeObjectId=id(self.frame.f_code),
                    posRange=pos_range,
                )
            )
