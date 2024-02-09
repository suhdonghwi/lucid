import { LocationRange } from "@/data/locRange";
import { Path } from "@/data/repository";

export type ExecutionTrace = {
  path: Path;
  locationRange: LocationRange;

  innerTraces: Array<{ source: LocationRange; trace: ExecutionTrace }>;
};

export { TraceManager } from "./TraceManager";
