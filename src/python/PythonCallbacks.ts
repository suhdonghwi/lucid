import type { PyProxy } from "pyodide/ffi";

import { EvalEvent, evalEventSchema } from "@/schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "@/schemas/FrameEvent";

export type PythonCallbacks = {
  onStmtEnter: (event: EvalEvent) => void;
  onStmtExit: (event: EvalEvent) => void;

  onFrameEnter: (event: FrameEvent) => void;
  onFrameExit: (event: FrameEvent) => void;
};

export const convertCallbacksForPyodide = (callbacks: PythonCallbacks) => ({
  stmt_enter: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtEnter(event);
  },

  stmt_exit: (maybeEvalEvent: PyProxy) => {
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
