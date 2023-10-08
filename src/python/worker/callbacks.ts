import { SyncExtras } from "comsync";

import { PyProxy } from "pyodide/ffi";

import type { CallGraph } from "@/CallGraph";
import type { ExecPointCallbacks } from "@/python/ExecPointCallbacks";
import { EvalEvent, evalEventSchema } from "@/schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "@/schemas/FrameEvent";

export function makeExecPointCallbacks(
  syncExtras: SyncExtras,
  onBreak: (callGraph: CallGraph) => void
): ExecPointCallbacks {
  const callGraph: CallGraph = [{ evalStack: [] }];

  return {
    onStmtEnter: (evalEvent: EvalEvent) => {
      callGraph.at(-1)?.evalStack.push(evalEvent.posRange);
    },
    onStmtExit: (evalEvent: EvalEvent) => {
      onBreak(callGraph);
      syncExtras.readMessage();

      callGraph.at(-1)?.evalStack.pop();
    },
    onFrameEnter: (frameEvent: FrameEvent) => {
      callGraph.push({ event: frameEvent, evalStack: [] });
    },
    onFrameExit: (frameEvent: FrameEvent) => {
      callGraph.pop();
    },
  };
}

type ExecPointCallbacksForPython = {
  [K in keyof ExecPointCallbacks]: (event: PyProxy) => void;
};

export const convertExecCallbacksForPython = (
  callbacks: ExecPointCallbacks
): ExecPointCallbacksForPython => ({
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
