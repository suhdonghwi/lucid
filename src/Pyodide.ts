import type { PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

export async function runPython(code: string): any {
  if (pyodide === null) {
    pyodide = await window.loadPyodide();
    return runPython(code);
  } else {
    return pyodide.runPythonAsync(code);
  }
}  

// await window.loadPyodide();
