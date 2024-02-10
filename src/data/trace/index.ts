import { LocationRange } from "@/data/locRange";
import { Path } from "@/data/repository";

type Message = unknown;

type Child =
  | {
      type: "trace";
      trace: ExecutionTrace;
    }
  | {
      type: "log";
      message: Message;
    };

export type ExecutionTrace = {
  path: Path;
  locationRange: LocationRange;

  children: Array<Child & { source: LocationRange }>;
  flattenedLogs: Message[];
};

export { TraceManager } from "./TraceManager";
