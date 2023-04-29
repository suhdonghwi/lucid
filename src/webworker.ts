import type { PyodideInterface } from "pyodide";
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

let pyodide: PyodideInterface;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }

  try {
    // await pyodide.loadPackagesFromImports(python);
    const result = await pyodide.runPythonAsync(python);

    self.postMessage({ result, id });
  } catch (erro) {
    self.postMessage({ error: error.message, id });
  }
};
