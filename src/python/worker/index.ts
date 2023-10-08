import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { ExecError, execErrorSchema } from "@/schemas/ExecError";
import {
  ExecPointCallbacks,
  convertExecCallbacksForPython,
} from "@/python/ExecPointCallbacks";

import { pyodidePromise } from "./initialize";

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
