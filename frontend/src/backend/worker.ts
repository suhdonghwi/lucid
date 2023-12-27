import * as Comlink from "comlink";

const createCodeObjectURL = (input: string) =>
  URL.createObjectURL(new Blob([input], { type: "text/javascript" }));

const api = {
  executeCode: (code: string) => {
    const objectURL = createCodeObjectURL(code);
    import(
      /* @vite-ignore */
      objectURL
    );
    URL.revokeObjectURL(objectURL);
  },
};

export type BackendAPI = typeof api;
Comlink.expose(api);
