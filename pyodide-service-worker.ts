import { serviceWorkerFetchListener } from "sync-message";

const fetchListener = serviceWorkerFetchListener();
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e: FetchEvent) => {
  console.log("fetch");

  if (fetchListener(e)) return;

  e.respondWith(fetch(e.request));
});

self.addEventListener("install", (e: FetchEvent) => {
  console.log("install");
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e: FetchEvent) => {
  console.log("activate");
  e.waitUntil(self.clients.claim());
});
