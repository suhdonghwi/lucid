import * as Comlink from "comlink";
import { instrument } from "./instrument";

import * as identifiers from "./instrument/identifiers";
import { EventCallbacks } from "./instrument/eventCallbacks";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const api = {
  executeCode: async (code: string) => {
    globalThis[identifiers.eventCallbacks] = {
      onFunctionEnter: () => console.log("onFunctionEnter"),
      onFunctionLeave: () => console.log("onFunctionLeave"),
    } as EventCallbacks;

    const instrumentedCode = instrument(code);
    console.log(instrumentedCode);

    const codeBlob = createCodeBlob(instrumentedCode);
    const objectURL = URL.createObjectURL(codeBlob);
    await import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);

    delete globalThis[identifiers.eventCallbacks];
  },
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
