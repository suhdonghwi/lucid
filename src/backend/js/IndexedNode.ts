import * as acorn from "acorn";

import { LocRange } from "@/trace/LocRange";

export type IndexedNode = acorn.Node & { index: number; sourceIndex: number };

export function locRange(node: IndexedNode): LocRange {
  return {
    sourceIndex: node.sourceIndex,
    start: node.start,
    end: node.end,
  };
}
