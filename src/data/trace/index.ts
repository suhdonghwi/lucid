import { LocationRange } from "@/data/locRange";
import { Path } from "@/data/repository";

type Child =
  | {
      type: "trace";
      source: LocationRange;
      trace: ExecutionTrace;
    }
  | {
      type: "log";
      source: LocationRange;
      content: string;
    };

export type ExecutionTrace = {
  path: Path;
  locationRange: LocationRange;

  children: Child[];
};

export { TraceManager } from "./TraceManager";
