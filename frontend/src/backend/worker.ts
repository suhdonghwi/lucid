import * as Comlink from "comlink";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const workerAPI = {
  executeCode: (code: string) => {
    const objectURL = URL.createObjectURL(createCodeBlob(code));
    import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);
  },
};

export type BackendWorkerAPI = typeof workerAPI;
Comlink.expose(workerAPI);
