import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import type { CodeRange } from "./CodeRange";

async function initializePyodide(): Promise<PyodideInterface> {
  await new Promise((r) => setTimeout(r, 5000));

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });
  pyodide.registerComlink(Comlink);

  console.log("[worker] pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("[worker] python setup files written.");
  return pyodide;
}

const pyodidePromise = initializePyodide();

export type RunPythonResult =
  | { type: "success"; data: any }
  | { type: "error"; message: string; range: CodeRange };

const api = {
  runPython: syncExpose(
    async (
      syncExtras,
      code: string,
      onBreak: (range: CodeRange) => void
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;

      const callbacks = {
        after_stmt: (range: CodeRange) => {
          onBreak(range);
          const readResult = syncExtras.readMessage();
        },
      };
      pyodide.registerJsModule("js_callbacks", callbacks);

      const fullCode = `from runner import run\nrun(${JSON.stringify(code)})`;
      const runResult = await pyodide.runPythonAsync(fullCode);

      if (
        typeof runResult === "object" &&
        runResult !== null &&
        runResult.type === "RunError"
      ) {
        return {
          type: "error",
          message: runResult.message,
          range: {
            lineNo: runResult.lineno,
            endLineNo: runResult.end_lineno,
            col: runResult.col,
            endCol: runResult.end_col,
          },
        };
      } else {
        return {
          type: "success",
          data: runResult,
        };
      }
    }
  ),
};

Comlink.expose(api);
export type PyodideWorkerAPI = typeof api;
