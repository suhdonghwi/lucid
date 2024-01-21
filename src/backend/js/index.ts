import * as Comlink from "comlink";

import { Repository } from "@/repository";

import Worker from "./worker?worker";
import { WorkerAPI } from "./worker";

let worker = new Worker();
let wrappedWorker = Comlink.wrap<WorkerAPI>(worker);

export function generateTrace(repo: Repository) {
  return wrappedWorker.generateTrace(repo);
}

export function terminateWorker() {
  worker.terminate();

  worker = new Worker();
  wrappedWorker = Comlink.wrap<WorkerAPI>(worker);
}
