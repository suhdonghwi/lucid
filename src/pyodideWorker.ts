import type { PyodideInterface } from "pyodide";
import type { PyodideResult } from "./pyodideHelper";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

declare global {
  interface Window {
    loadPyodide: ({
      stdout,
    }: {
      stdout?: (msg: string) => void;
    }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}

async function initializePyodide() {
  self.pyodide = await self.loadPyodide({ stdout: console.log });
  console.log("[worker] pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    self.pyodide.FS.writeFile(name, code);
  }

  console.log("[worker] python starter files written.");
}

const pyodideReadyPromise = initializePyodide();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;

  try {
    const result = await self.pyodide.runPythonAsync(python);
    self.postMessage({ type: "success", result, id } as PyodideResult);
  } catch (error) {
    self.postMessage({ type: "error", error, id } as PyodideResult);
  }
};
