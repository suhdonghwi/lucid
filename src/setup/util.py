from pyodide.ffi import to_js, JsProxy
import js


def js_object(**kwargs) -> JsProxy:
    return to_js(kwargs, dict_converter=js.Object.fromEntries)
