import * as Comlink from "comlink";

import BackendWorker from "./worker?worker";
import { BackendAPI } from "./worker";

export const backendWorker = Comlink.wrap<BackendAPI>(new BackendWorker());
