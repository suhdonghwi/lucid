import sys
import ast

IS_PYODIDE = "pyodide" in sys.modules

if IS_PYODIDE:
    import callbacks  # type: ignore
    from util import js_range_object


class StmtContext:
    def __init__(self, node: ast.stmt):
        self.node = node

    def __enter__(self):
        self.frame = sys._getframe(1)

        if IS_PYODIDE:
            callbacks.onStmtEnter(
                frameId=id(self.frame), posRange=js_range_object(self.node)
            )

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is not None:
            return False

        if IS_PYODIDE:
            callbacks.onStmtExit(
                frameId=id(self.frame), posRange=js_range_object(self.node)
            )
