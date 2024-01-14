import * as Comlink from "comlink";

import { generateTrace } from "./generateTrace";

const api = {
  generateTrace,
};

export type WorkerAPI = typeof api;
Comlink.expose(api);
