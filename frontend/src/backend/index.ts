import * as Comlink from "comlink";

import BackendWorker from "./worker?worker";
import { BackendWorkerAPI } from "./worker";

let worker = new BackendWorker();
let wrappedWorker = Comlink.wrap<BackendWorkerAPI>(worker);

export function executeCode(code: string) {
  return wrappedWorker.executeCode(code);
}

export function terminateWorker() {
  worker.terminate();

  worker = new BackendWorker();
  wrappedWorker = Comlink.wrap<BackendWorkerAPI>(worker);
}
