import type { PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";
import { loadPyodide } from "pyodide";

import * as Comlink from "comlink";
import { syncExpose, SyncExtras } from "comsync";

import { ExecError, execErrorSchema } from "./schemas/ExecError";
import { Frame, frameSchema } from "./schemas/Frame";
import { EvalEvent, evalEventSchema } from "./schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "./schemas/FrameEvent";

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

export type Callbacks = {
  onStmtEnter: (event: EvalEvent) => void;
  onStmtExit: (event: EvalEvent) => void;

  onFrameEnter: (event: FrameEvent) => void;
  onFrameExit: (event: FrameEvent) => void;
};

const makeCallbacksForPython = (
  syncExtras: SyncExtras,
  callbacks: Callbacks
) => ({
  stmt_enter: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);

    callbacks.onStmtEnter(event);
  },

  stmt_exit: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtExit(event);

    return syncExtras.readMessage();
  },

  frame_enter: (maybeFrameEvent: PyProxy) => {
    const frameEvent = frameEventSchema.parse(maybeFrameEvent);
    callbacks.onFrameEnter(frameEvent);
  },

  // TODO: add frame info
  frame_exit: (maybeFrameEvent: PyProxy) => {
    const frameEvent = frameEventSchema.parse(maybeFrameEvent);
    callbacks.onFrameExit(frameEvent);
  },
});

export type RunPythonResult =
  | { type: "success" }
  | { type: "error"; error: ExecError };

const api = {
  runPython: syncExpose(
    async (
      syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
      callbacks: Callbacks
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacksForPython = makeCallbacksForPython(syncExtras, callbacks);

      pyodide.registerJsModule("js_callbacks", {});
      const jsCallbacksModule = pyodide.pyimport("js_callbacks");

      for (const [name, func] of Object.entries(callbacksForPython)) {
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
