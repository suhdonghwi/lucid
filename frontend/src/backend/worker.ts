import * as Comlink from "comlink";

const api = {
  executeCode: (code: string) => {
    eval(code);
  },
};

export type BackendAPI = typeof api;
Comlink.expose(api);
