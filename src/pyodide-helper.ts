import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";
import * as Comlink from "comlink";

import PyodideWorker from "./pyodide-worker?worker";
import type {
  Callbacks,
  PyodideWorkerAPI,
  RunPythonResult,
} from "./pyodide-worker";

async function initializeClient(): Promise<SyncClient<PyodideWorkerAPI>> {
  await navigator.serviceWorker.register(
    new URL("../pyodide-service-worker.ts", import.meta.url),
    {
      type: "module",
    }
  );

  const channel = makeChannel();
  console.log("Channel :", channel);

  return new SyncClient(() => new PyodideWorker(), channel);
}

const clientPromise = initializeClient();

export async function runPython(
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

export async function writeMessage() {
  const client = await clientPromise;
  await client.writeMessage("Hello");
}

export async function interrupt() {
  const client = await clientPromise;
  await client.interrupt();
}
