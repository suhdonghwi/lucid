import * as Comlink from "comlink";

import { Repository, SerializedRepository } from "@/data/repository";

import { generateTrace } from "./generateTrace";

const api = {
  generateTrace: (serializedRepo: SerializedRepository) => {
    return generateTrace(Repository.deserialize(serializedRepo));
  },
};

export type WorkerAPI = typeof api;
Comlink.expose(api);
