import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";

import PyodideWorker from "./pyodide-worker?worker";
import type { PyodideWorkerAPI } from "./pyodide-worker";

async function initializeClient(): Promise<SyncClient<PyodideWorkerAPI>> {
  await navigator.serviceWorker.register(
    new URL("../pyodide-service-worker.ts", import.meta.url),
    {
      type: "module",
    }
  );

  const channel = makeChannel();
  console.log("Channel type:", channel);

  const client = new SyncClient(() => new PyodideWorker(), channel);

  return client;
}

const clientPromise = initializeClient();

async function runPython(code: string) {
  const client = await clientPromise;
  const result = client.call(client.workerProxy.runPython, code);

  return result;
}

export { runPython };
