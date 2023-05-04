import type { PyodideInterface } from "pyodide";
import type { PyBuffer, PyProxy, PythonError } from "pyodide/ffi";
import type { PyodideResult } from "./PyodideHelper";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

declare global {
  interface Window {
    loadPyodide: ({
      stdout,
    }: {
      stdout?: (msg: string) => void;
    }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}

async function initializePyodide() {
  self.pyodide = await self.loadPyodide({
    stdout: (msg) => console.log("stdout:", msg),
  });
  console.log("[worker] pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    self.pyodide.FS.writeFile(name, code);
  }

  console.log("[worker] python setup files written.");
}

const pyodideReadyPromise = initializePyodide();

function proxyConverter(proxy: PyProxy): any {
  return undefined;
}

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, code, ...context } = event.data;

  const pyResult: PyBuffer = await self.pyodide.runPythonAsync(code);

  if (pyResult.type === "RunError") {
    self.postMessage({
      type: "error",
      error: {
        message: pyResult.message,
        line: pyResult.line,
        end_line: pyResult.end_line,
        offset: pyResult.offset,
        end_offset: pyResult.end_offset,
      },
      id,
    } as PyodideResult);
    return;
  }

  const jsResult = pyResult.toJs({
    default_converter: proxyConverter,
  });

  self.postMessage({
    type: "success",
    result: jsResult,
    id,
  } as PyodideResult);
};
