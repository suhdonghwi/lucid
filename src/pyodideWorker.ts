import type { PyodideInterface } from "pyodide";
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

let pyodide: PyodideInterface;

async function loadPyodideAndPackages() {
  // @ts-expect-error `loadPyodide` is imported from `importScripts`, which is not recognized by TypeScript.
  pyodide = await loadPyodide();
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;

  try {
    // await pyodide.loadPackagesFromImports(python);
    const result = await pyodide.runPythonAsync(python);

    self.postMessage({ result, id });
  } catch (error) {
    self.postMessage({ error, id });
  }
};
