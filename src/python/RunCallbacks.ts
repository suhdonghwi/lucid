import type { PyProxy } from "pyodide/ffi";

import { EvalEvent, evalEventSchema } from "@/schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "@/schemas/FrameEvent";

export type RunCallbacks = {
  onStmtEnter: (event: EvalEvent) => void;
  onStmtExit: (event: EvalEvent) => void;

  onFrameEnter: (event: FrameEvent) => void;
  onFrameExit: (event: FrameEvent) => void;
};

type RunCallbacksForPython = {
  [K in keyof RunCallbacks]: (event: PyProxy) => void;
};

export const convertCallbacksForPython = (
  callbacks: RunCallbacks
): RunCallbacksForPython => ({
  onStmtEnter: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtEnter(event);
  },

  onStmtExit: (maybeEvalEvent: PyProxy) => {
    const event = evalEventSchema.parse(maybeEvalEvent);
    callbacks.onStmtExit(event);
  },

  onFrameEnter: (maybeFrameEvent: PyProxy) => {
    const frameEvent = frameEventSchema.parse(maybeFrameEvent);
    callbacks.onFrameEnter(frameEvent);
  },

  onFrameExit: (maybeFrameEvent: PyProxy) => {
    const frameEvent = frameEventSchema.parse(maybeFrameEvent);
    callbacks.onFrameExit(frameEvent);
  },
});
