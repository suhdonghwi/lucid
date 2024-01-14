import * as Comlink from "comlink";

import Worker from "./worker?worker";
import { WorkerAPI } from "./worker";

let worker = new Worker();
let wrappedWorker = Comlink.wrap<WorkerAPI>(worker);

export function generateTrace(code: string) {
  return wrappedWorker.generateTrace(code);
}

export function terminateWorker() {
  worker.terminate();

  worker = new Worker();
  wrappedWorker = Comlink.wrap<WorkerAPI>(worker);
}
