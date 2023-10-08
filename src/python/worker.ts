import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

import { ExecError, execErrorSchema } from "@/schemas/ExecError";
import {
  ExecPointCallbacks,
  convertExecCallbacksForPython,
} from "./ExecPointCallbacks";

export async function initializePyodide(): Promise<PyodideInterface> {
  console.log("loading pyodide");

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });

  console.log("pyodide load complete.");

  pyodide.registerComlink(Comlink);
  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("python setup files written.");
  return pyodide;
}

const pyodidePromise = initializePyodide();

export type RunResult =
  | { type: "success" }
  | { type: "error"; error: ExecError };

const api = {
  run: syncExpose(
    async (
      syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
      execPointCallbacks: ExecPointCallbacks
    ): Promise<RunResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacksForPython =
        convertExecCallbacksForPython(execPointCallbacks);

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

export type PyodideWorkerAPI = typeof api;
Comlink.expose(api);
