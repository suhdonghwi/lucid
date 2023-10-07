import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

import { ExecError, execErrorSchema } from "@/schemas/ExecError";
import { RunCallbacks, convertCallbacksForPython } from "./RunCallbacks";

export async function initializePyodide(): Promise<PyodideInterface> {
  console.log("loading pyodide");

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });
  pyodide.registerComlink(Comlink);

  console.log("pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("python setup files written.");
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
      callbacks: RunCallbacks
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacksForPython = convertCallbacksForPython(callbacks);

      pyodide.registerJsModule("callbacks", {});
      const callbacksModule = pyodide.pyimport("callbacks");

      for (const [name, func] of Object.entries(callbacksForPython)) {
        callbacksModule[name] = func;
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
