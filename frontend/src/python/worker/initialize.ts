import * as Comlink from "comlink";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

async function initializePyodide(): Promise<PyodideInterface> {
  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });

  pyodide.registerComlink(Comlink);

  await pyodide.loadPackage("/lucid_backend_pyodide-0.0.1--none-any.whl");
  return pyodide;
}

export const pyodidePromise = initializePyodide();
