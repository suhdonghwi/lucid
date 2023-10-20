import * as Comlink from "comlink";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

async function initializePyodide(): Promise<PyodideInterface> {
  console.log("loading pyodide");

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });

  console.log("pyodide load complete.");

  pyodide.registerComlink(Comlink);

  pyodide.loadPackage("/lucid_backend_pyodide-0.0.1--none-any.whl");

  console.log("python setup files written.");
  return pyodide;
}

export const pyodidePromise = initializePyodide();
