import * as Comlink from "comlink";

import ExecuteWorker from "./executeWorker?worker";
import { ExecuteWorkerAPI } from "./executeWorker";

let worker = new ExecuteWorker();
let wrappedWorker = Comlink.wrap<ExecuteWorkerAPI>(worker);

export function executeCode(code: string) {
  return wrappedWorker.executeCode(code);
}

export function terminateWorker() {
  worker.terminate();

  worker = new ExecuteWorker();
  wrappedWorker = Comlink.wrap<ExecuteWorkerAPI>(worker);
}
