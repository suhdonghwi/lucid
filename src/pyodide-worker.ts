import type { PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";
import { loadPyodide } from "pyodide";

import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { ExecError, execErrorSchema } from "./schemas/ExecError";
import { PosRange, posRangeSchema } from "./schemas/PosRange";

async function initializePyodide(): Promise<PyodideInterface> {
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
  | { type: "success" }
  | { type: "error"; error: ExecError };

const api = {
  runPython: syncExpose(
    async (
      syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
      onBreak: (range: PosRange) => void
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacks = {
        after_stmt: (maybeRange: PyProxy) => {
          const range = posRangeSchema.parse(maybeRange);
          onBreak(range);

          return syncExtras.readMessage();
        },
      };

      const jsCallbacksModule = pyodide.pyimport("js_callbacks");
      for (const [name, func] of Object.entries(callbacks)) {
        jsCallbacksModule[name] = func;
      }

      const fullCode = `from runner import run\nrun(${JSON.stringify(code)})`;

      const execResult = await pyodide.runPythonAsync(fullCode);
      if (execResult !== undefined) {
        const execError = execErrorSchema.parse(execResult);
        return { type: "error", error: execError };
      }

      return { type: "success" };
    }
  ),
};

Comlink.expose(api);
export type PyodideWorkerAPI = typeof api;
