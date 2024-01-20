import * as acorn from "acorn";
import estree from "estree";
import { walk } from "estree-walker";

import { LocRange } from "@/trace/LocRange";

export type IndexedNode = acorn.Node & { index: number; sourceIndex: number };

export function indexAST(
  ast: acorn.Program,
  sourceIndex: number,
): IndexedNode[] {
  const nodes: IndexedNode[] = [];

  walk(ast as estree.Program, {
    enter(node) {
      // @ts-expect-error index is not a valid property on estree nodes
      node.index = nodes.length;

      // @ts-expect-error sourceIndex is not a valid property on estree nodes
      node.sourceIndex = sourceIndex;

      nodes.push(node as IndexedNode);
    },
  });

  return nodes;
}

export function locRange(node: IndexedNode): LocRange {
  return {
    sourceIndex: node.sourceIndex,
    start: node.start,
    end: node.end,
  };
}
