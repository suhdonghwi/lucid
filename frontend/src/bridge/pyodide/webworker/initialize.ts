import * as Comlink from "comlink";

import { loadPyodide, PyodideInterface } from "pyodide";

import pyodideBackendUrl from "./lucid_backend_pyodide.whl?url";

const INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/";

async function initializePyodide(): Promise<PyodideInterface> {
  const pyodide = await loadPyodide({ indexURL: INDEX_URL });

  pyodide.registerComlink(Comlink);
  await pyodide.loadPackage(pyodideBackendUrl);

  return pyodide;
}

export let pyodidePromise = initializePyodide();

export async function reloadPyodide() {
  pyodidePromise = initializePyodide();
}
