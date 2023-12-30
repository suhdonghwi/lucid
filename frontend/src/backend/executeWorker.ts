import * as Comlink from "comlink";
import { instrument } from "./instrument";

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const api = {
  executeCode: async (code: string) => {
    const sharedModuleCodeBlob = createCodeBlob(`
      export const enterCount = [];
      export const enter = () => {
        enterCount.push(1);
        console.log("enter");
      }
      export const leave = () => console.log("leave");
    `);
    const sharedModuleObjectURL = URL.createObjectURL(sharedModuleCodeBlob);

    const instrumentedCode = instrument(code, sharedModuleObjectURL);
    console.log(instrumentedCode);

    const codeBlob = createCodeBlob(
      "import {enter,leave} from " +
        JSON.stringify(sharedModuleObjectURL) +
        ";\n" +
        instrumentedCode,
    );
    const objectURL = URL.createObjectURL(codeBlob);
    await import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);

    import(sharedModuleObjectURL).then((module) => {
      console.log(module);
    });
  },
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
