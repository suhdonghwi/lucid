import * as Comlink from "comlink";

import { loadPyodide, PyodideInterface } from "pyodide";

import pyodideBackendUrl from "./lucid_backend_pyodide.whl?url";

async function initializePyodide(): Promise<PyodideInterface> {
  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/";
  const pyodide = await loadPyodide({ indexURL });

  pyodide.registerComlink(Comlink);

  await pyodide.loadPackage(pyodideBackendUrl);
  return pyodide;
}

export const pyodidePromise = initializePyodide();
