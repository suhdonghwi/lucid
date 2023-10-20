import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { pyodidePromise } from "./initialize";

import { execErrorSchema } from "@/schemas/ExecError";
import { ExecResult } from "@/schemas/ExecResult";
import { CallGraph } from "@/CallGraph";

import {
  convertExecCallbacksForPython,
  makeExecPointCallbacks,
} from "./callbacks";

const api = {
  run: syncExpose(
    async (
      syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
      onBreak: (callGraph: CallGraph) => void
    ): Promise<ExecResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const execPointCallbacks = makeExecPointCallbacks(syncExtras, onBreak);
      const callbacksForPython =
        convertExecCallbacksForPython(execPointCallbacks);

      pyodide.registerJsModule("callbacks", {});
      const callbacksModule = pyodide.pyimport("callbacks");

      for (const [name, func] of Object.entries(callbacksForPython)) {
        callbacksModule[name] = func;
      }

      const fullCode = `from lucid_backend_pyodide import execute\nexecute(${JSON.stringify(
        code
      )})`;
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
