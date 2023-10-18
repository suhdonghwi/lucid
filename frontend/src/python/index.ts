import * as Comlink from "comlink";

import { initializeSyncClient } from "./sync-client";

import { CallGraph } from "@/CallGraph";
import type { ExecResult } from "@/schemas/ExecResult";

const clientPromise = initializeSyncClient();

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

  return await client.call(
    client.workerProxy.run,
    interruptBuffer,
    code,
    Comlink.proxy(onBreak)
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
