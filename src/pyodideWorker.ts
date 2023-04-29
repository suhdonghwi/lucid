import type { PyodideInterface } from "pyodide";
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

async function loadPyodideAndPackages() {
  self.pyodide = await self.loadPyodide({ stdout: console.log });
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;

  try {
    // await pyodide.loadPackagesFromImports(python);
    const result = await self.pyodide.runPythonAsync(python);

    self.postMessage({ result, id });
  } catch (error) {
    self.postMessage({ error, id });
  }
};
