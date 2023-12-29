import * as Comlink from "comlink";
import { instrument } from "./instrument";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const api = {
  executeCode: (code: string) => {
    instrument(code);

    const objectURL = URL.createObjectURL(createCodeBlob(code));
    import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);
  },
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
