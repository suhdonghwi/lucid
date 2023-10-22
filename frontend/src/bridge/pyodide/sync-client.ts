import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";

import PyodideWorker from "./webworker?worker";
import type { PyodideWorkerAPI } from "./webworker";

import serviceWorkerUrl from "./service-worker?worker&url";

export async function initializeSyncClient(): Promise<
  SyncClient<PyodideWorkerAPI>
> {
  await navigator.serviceWorker.register(serviceWorkerUrl, { type: "module" });

  const channel = makeChannel();
  console.log("created sync client :", channel);

  return new SyncClient(() => new PyodideWorker(), channel);
}
