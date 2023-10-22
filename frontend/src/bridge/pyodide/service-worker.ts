import { serviceWorkerFetchListener } from "sync-message";

const fetchListener = serviceWorkerFetchListener();
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e) => {
  if (fetchListener(e)) return;
  e.respondWith(fetch(e.request));
});

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
