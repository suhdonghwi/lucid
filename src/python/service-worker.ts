import { serviceWorkerFetchListener } from "sync-message";

const fetchListener = serviceWorkerFetchListener();
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e: FetchEvent) => {
  if (fetchListener(e)) return;
  e.respondWith(fetch(e.request));
});

self.addEventListener("install", (e: ExtendableEvent) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e: ExtendableEvent) => {
  e.waitUntil(self.clients.claim());
});
