import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { initializePyodide } from "./initialize";

import { ExecError, execErrorSchema } from "@/schemas/ExecError";
import { PythonCallbacks, makePythonCallbacks } from "./PythonCallbacks";

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
      callbacks: PythonCallbacks
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const pythonCallbacks = makePythonCallbacks(syncExtras, callbacks);

      pyodide.registerJsModule("callbacks", {});
      const callbacksModule = pyodide.pyimport("callbacks");

      for (const [name, func] of Object.entries(pythonCallbacks)) {
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
