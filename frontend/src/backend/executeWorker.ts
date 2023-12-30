import * as Comlink from "comlink";
import { instrument } from "./instrument";

import { result } from "./instrument/eventCallbacks";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const api = {
  executeCode: async (code: string) => {
    const eventCallbackModuleURL = new URL(
      "./instrument/eventCallbackModule",
      import.meta.url,
    );
    console.log(eventCallbackModuleURL);

    const instrumentedCode = instrument(
      code,
      eventCallbackModuleURL.toString(),
    );
    console.log(instrumentedCode);

    const codeBlob = createCodeBlob(instrumentedCode);
    const objectURL = URL.createObjectURL(codeBlob);
    await import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);

    console.log(result);
  },
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
