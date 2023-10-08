import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { execErrorSchema } from "@/schemas/ExecError";
import { ExecResult } from "@/schemas/ExecResult";
import {
  ExecPointCallbacks,
  convertExecCallbacksForPython,
} from "@/python/ExecPointCallbacks";

import { pyodidePromise } from "./initialize";

const api = {
  run: syncExpose(
    async (
      syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
      execPointCallbacks: ExecPointCallbacks
    ): Promise<ExecResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacksForPython =
        convertExecCallbacksForPython(execPointCallbacks);
      pyodide.registerJsModule("callbacks", callbacksForPython);

      const fullCode = `from runner import run\nrun(${JSON.stringify(code)})`;

      const pythonResult = await pyodide.runPythonAsync(fullCode);

      if (pythonResult !== undefined) {
        const execError = execErrorSchema.parse(pythonResult);
        return { type: "error", error: execError };
      }

      return { type: "success" };
    }
  ),
};

export type PyodideWorkerAPI = typeof api;
Comlink.expose(api);
