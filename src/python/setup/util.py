from typing import Any

import ast

from pyodide.ffi import to_js, JsProxy
import js


def js_object(**kwargs: Any) -> JsProxy:
    return to_js(kwargs, dict_converter=js.Object.fromEntries)


def js_range_object(node: ast.AST):
    return js_object(
        lineno=node.lineno,
        endLineno=node.end_lineno,
        col=node.col_offset,
        endCol=node.end_col_offset,
    )
