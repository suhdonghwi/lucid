const pyodideWorker = new Worker(
  new URL("./pyodideWorker.ts", import.meta.url)
);

export type PyodideResult =
  | {
      type: "success";
      result: any;
      id: number;
    }
  | {
      type: "error";
      error: any;
      id: number;
    };
const callbacks: Record<number, (value: PyodideResult) => void> = {};

pyodideWorker.onmessage = (event) => {
  const data = event.data as PyodideResult;
  const onSuccess = callbacks[data.id];
  delete callbacks[data.id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (script: string, context: any) => {
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise<PyodideResult>((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

export { asyncRun };
