import * as Comlink from "comlink";

import { makeChannel } from "sync-message";
import { SyncClient } from "comsync";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

import PyodideWorker from "./worker?worker";
import type { PyodideWorkerAPI } from "./worker";

export async function initializePyodide(): Promise<PyodideInterface> {
  console.log("loading pyodide");

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });
  pyodide.registerComlink(Comlink);

  console.log("pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("python setup files written.");
  return pyodide;
}

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
