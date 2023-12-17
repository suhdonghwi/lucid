import * as Comlink from "comlink";

import BackendWorker from "./worker?worker";
import { BackendAPI } from "./worker";

let worker = new BackendWorker();
let wrappedWorker = Comlink.wrap<BackendAPI>(worker);

export function executeCode(code: string) {
  return wrappedWorker.executeCode(code);
}

export function terminateWorker() {
  worker.terminate();

  worker = new BackendWorker();
  wrappedWorker = Comlink.wrap<BackendAPI>(worker);
}
