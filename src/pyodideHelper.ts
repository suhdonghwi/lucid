import type { RunError } from "./RunError";
import type { TrackData } from "./TrackData";

const worker = new Worker(new URL("./PyodideWorker.ts", import.meta.url));
export type PyodideResult =
  | {
      type: "success";
      data: TrackData[];
      id: number;
    }
  | {
      type: "error";
      error: RunError;
      id: number;
    };

const callbacks: Record<number, (value: PyodideResult) => void> = {};

worker.onmessage = (event) => {
  const data = event.data as PyodideResult;
  const onSuccess = callbacks[data.id];
  delete callbacks[data.id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (code: string, context: any) => {
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    const modifiedCode = `from runner import run\nrun(${JSON.stringify(code)})`;

    return new Promise<PyodideResult>((onSuccess) => {
      callbacks[id] = onSuccess;
      worker.postMessage({
        ...context,
        code: modifiedCode,
        id,
      });
    });
  };
})();

export { asyncRun };
