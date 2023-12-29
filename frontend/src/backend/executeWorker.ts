import * as Comlink from "comlink";
import { instrument } from "./instrument";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const api = {
  executeCode: (code: string) => {
    const instrumentedCode = instrument(code);
    console.log(instrumentedCode);

    const codeBlob = createCodeBlob(instrumentedCode);
    const objectURL = URL.createObjectURL(codeBlob);
    import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);
  },
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
