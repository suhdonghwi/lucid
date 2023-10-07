import * as Comlink from "comlink";

import type { RunPythonResult, Callbacks } from "./worker";

import { initializeSyncClient } from "./initialize";

const clientPromise = initializeSyncClient();

export async function run(
  code: string,
  callbacks: Callbacks
): Promise<RunPythonResult> {
  const client = await clientPromise;

  let interruptBuffer = undefined;
  if (client.channel?.type === "atomics") {
    interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    client.interrupter = () => {
      interruptBuffer[0] = 2;
    };
  }

  return await client.call(
    client.workerProxy.runPython,
    interruptBuffer,
    code,
    Comlink.proxy(callbacks)
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
