import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";

import PyodideWorker from "./worker?worker";
import type { PyodideWorkerAPI } from "./worker";

export async function initializeSyncClient(): Promise<
  SyncClient<PyodideWorkerAPI>
> {
  console.log("creating sync client");

  await navigator.serviceWorker.register(
    new URL("./service-worker.ts", import.meta.url),
    { type: "module" }
  );

  const channel = makeChannel();
  console.log("created sync client :", channel);
  return new SyncClient(() => new PyodideWorker(), channel);
}
