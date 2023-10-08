import * as Comlink from "comlink";

import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

async function initializePyodide(): Promise<PyodideInterface> {
  console.log("loading pyodide");

  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });

  console.log("pyodide load complete.");

  pyodide.registerComlink(Comlink);
  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("python setup files written.");
  return pyodide;
}

export const pyodidePromise = initializePyodide();
