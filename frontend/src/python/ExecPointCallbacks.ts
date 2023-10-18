import { EvalEvent } from "@/schemas/EvalEvent";
import { FrameEvent } from "@/schemas/FrameEvent";

export type ExecPointCallbacks = {
  onStmtEnter: (event: EvalEvent) => void;
  onStmtExit: (event: EvalEvent) => void;

  onFrameEnter: (event: FrameEvent) => void;
  onFrameExit: (event: FrameEvent) => void;
};
