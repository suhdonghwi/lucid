import { serviceWorkerFetchListener } from "sync-message";

const fetchListener = serviceWorkerFetchListener();
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e: FetchEvent) => {
  if (fetchListener(e)) {
    return;
  }
  e.respondWith(fetch(e.request));
});
