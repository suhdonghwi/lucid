import { LocationRange } from "@/data/locRange";
import { Path } from "@/data/repository";

type Child =
  | {
      type: "trace";
      trace: ExecutionTrace;
    }
  | {
      type: "log";
      message: unknown;
    };

export type ExecutionTrace = {
  path: Path;
  locationRange: LocationRange;

  children: Array<Child & { source: LocationRange }>;
};

export { TraceManager } from "./TraceManager";
