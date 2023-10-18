import { FrameEvent } from "@/schemas/FrameEvent";
import { EvalEvent } from "./schemas/EvalEvent";

export type CallNode = {
  frameEvent?: FrameEvent;
  evalStack: EvalEvent[];
};

export type CallGraph = [CallNode, ...CallNode[]];
