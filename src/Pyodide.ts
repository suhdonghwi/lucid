import type { PyodideInterface } from "pyodide";

const pyodide: PyodideInterface = await window.loadPyodide();

export default pyodide;
