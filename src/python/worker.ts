import type { PyProxy } from "pyodide/ffi";

import * as Comlink from "comlink";
import { syncExpose, SyncExtras } from "comsync";

import { initializePyodide } from "./initialize";

import { ExecError, execErrorSchema } from "@/schemas/ExecError";
import { EvalEvent, evalEventSchema } from "@/schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "@/schemas/FrameEvent";

const pyodidePromise = initializePyodide();

export type Callbacks = {
  onStmtEnter: (event: EvalEvent) => void;
  onStmtExit: (event: EvalEvent) => void;

  onFrameEnter: (event: FrameEvent) => void;
  onFrameExit: (event: FrameEvent) => void;
};

const makeCallbacksForPython = (extras: SyncExtras, callbacks: Callbacks) => ({
  stmt_enter: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtEnter(event);
  },

  stmt_exit: (maybeEvalEvent: PyProxy) => {
    extras.readMessage();

    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtExit(event);
  },

  frame_enter: (maybeFrameEvent: PyProxy) => {
    const frameEvent = frameEventSchema.parse(maybeFrameEvent);
    callbacks.onFrameEnter(frameEvent);
  },

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
      extras,
      interruptBuffer: Uint8Array,
      code: string,
      callbacks: Callbacks
    ): Promise<RunPythonResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      const callbacksForPython = makeCallbacksForPython(extras, callbacks);

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
