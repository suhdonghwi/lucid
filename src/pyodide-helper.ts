import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";
import * as Comlink from "comlink";

import PyodideWorker from "./pyodide-worker?worker";
import type { PyodideWorkerAPI, RunPythonResult } from "./pyodide-worker";
import type { PosRange } from "./schemas/PosRange";

async function initializeClient(): Promise<SyncClient<PyodideWorkerAPI>> {
  await navigator.serviceWorker.register(
    new URL("../pyodide-service-worker.ts", import.meta.url),
    {
      type: "module",
    }
  );

  const channel = makeChannel();
  console.log("Channel:", channel);

  const client = new SyncClient(() => new PyodideWorker(), channel);

  return client;
}

const clientPromise = initializeClient();

export async function runPython(
  code: string,
  onBreak: (range: PosRange) => void
): Promise<RunPythonResult> {
  const client = await clientPromise;

  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

  client.interrupter = () => {
    console.log("interrupt");
    interruptBuffer[0] = 2;
  };

  return await client.call(
    client.workerProxy.runPython,
    interruptBuffer,
    code,
    Comlink.proxy(onBreak)
  );
}

export async function writeMessage() {
  const client = await clientPromise;
  await client.writeMessage("Hello");
}

export async function interrupt() {
  const client = await clientPromise;
  await client.interrupt();
}
