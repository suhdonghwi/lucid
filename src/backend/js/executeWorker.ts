import * as Comlink from "comlink";

import { execute } from "./execute";

const api = {
  executeCode: execute,
};

export type ExecuteWorkerAPI = typeof api;
Comlink.expose(api);
