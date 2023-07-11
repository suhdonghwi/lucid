import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";

import PyodideWorker from "./PyodideWorker?worker";
import type { PyodideWorkerAPI } from "./PyodideWorker";

async function initializeClient(): Promise<SyncClient<PyodideWorkerAPI>> {
  await navigator.serviceWorker.register(
    new URL("../PyodideServiceWorker.ts", import.meta.url),
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
