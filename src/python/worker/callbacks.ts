import { SyncExtras } from "comsync";

import { PyProxy } from "pyodide/ffi";

import { CallGraph, CallNode } from "@/CallGraph";
import { ExecPointCallbacks } from "@/python/ExecPointCallbacks";
import { EvalEvent, evalEventSchema } from "@/schemas/EvalEvent";
import { FrameEvent, frameEventSchema } from "@/schemas/FrameEvent";

export function makeExecPointCallbacks(
  syncExtras: SyncExtras,
  onBreak: (callGraph: CallGraph) => void
): ExecPointCallbacks {
  const callGraph = new CallGraph();

  return {
    onStmtEnter: (evalEvent: EvalEvent) => {
      callGraph.top().push(evalEvent.posRange);
    },
    onStmtExit: (evalEvent: EvalEvent) => {
      onBreak(callGraph);
      syncExtras.readMessage();

      callGraph.top().pop();
    },
    onFrameEnter: (frameEvent: FrameEvent) => {
      callGraph.push(new CallNode(frameEvent));
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
