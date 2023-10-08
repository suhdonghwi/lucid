import * as Comlink from "comlink";

import { initializeSyncClient } from "./sync-client";
import { ExecPointCallbacks } from "./ExecPointCallbacks";

import { CallGraph, CallNode } from "@/CallGraph";
import type { EvalEvent } from "@/schemas/EvalEvent";
import type { FrameEvent } from "@/schemas/FrameEvent";
import type { ExecResult } from "@/schemas/ExecResult";

const clientPromise = initializeSyncClient();

const makeExecPointCallbacks = (callGraph: CallGraph): ExecPointCallbacks => ({
  onStmtEnter: (evalEvent: EvalEvent) => {
    callGraph.top().push(evalEvent.posRange);
  },
  onStmtExit: (evalEvent: EvalEvent) => {
    callGraph.top().pop();
  },
  onFrameEnter: (frameEvent: FrameEvent) => {
    callGraph.push(new CallNode(frameEvent));
  },
  onFrameExit: (frameEvent: FrameEvent) => {
    callGraph.pop();
  },
});

export async function execute(
  code: string,
  onBreak: (callGraph: CallGraph) => void
): Promise<ExecResult> {
  const client = await clientPromise;

  let interruptBuffer: Uint8Array | undefined = undefined;
  if (client.channel?.type === "atomics") {
    interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    client.interrupter = () => {
      if (interruptBuffer !== undefined) {
        interruptBuffer[0] = 2;
      }
    };
  }

  const callGraph = new CallGraph();
  const execPointCallbacks = makeExecPointCallbacks(callGraph);

  return await client.call(
    client.workerProxy.run,
    interruptBuffer,
    code,
    Comlink.proxy(execPointCallbacks)
  );
}

export async function resume() {
  const client = await clientPromise;
  await client.writeMessage("Hello");
}

export async function interrupt() {
  const client = await clientPromise;
  await client.interrupt();
}
