import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";
import { PyodideWorkerAPI } from "./PyodideWorker";

async function initializeClient(): Promise<SyncClient<PyodideWorkerAPI>> {
  await navigator.serviceWorker.register(
    new URL("./PyodideServiceWorker.ts", import.meta.url),
    { type: "module" }
  );

  const channel = makeChannel();
  console.log("Channel type:", channel?.type);

  const client = new SyncClient(
    () =>
      new Worker(new URL("./PyodideWorker.ts", import.meta.url), {
        type: "module",
      }),
    channel
  );

  return client;
}

const clientPromise = initializeClient();

async function runPython(code: string) {
  const client = await clientPromise;
  const result = await client.call(client.workerProxy.runPython, code);

  return result;
}

export { runPython };
