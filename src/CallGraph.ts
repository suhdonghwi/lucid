import { FrameEvent } from "@/schemas/FrameEvent";
import { PosRange } from "@/schemas/PosRange";

export type CallNode = {
  event?: FrameEvent;
  evalStack: PosRange[];
};

export type CallGraph = [CallNode, ...CallNode[]];
