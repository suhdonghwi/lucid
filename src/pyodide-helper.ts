import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";
import * as Comlink from "comlink";

import PyodideWorker from "./pyodide-worker?worker";
import type { PyodideWorkerAPI } from "./pyodide-worker";
import { CodeRange } from "./CodeRange";

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
  onBreak: (range: CodeRange) => void
) {
  const client = await clientPromise;
  const result = client.call(
    client.workerProxy.runPython,
    code,
    Comlink.proxy(onBreak)
  );

  return result;
}

export async function writeMessage() {
  const client = await clientPromise;
  await client.writeMessage("Hello");
}
