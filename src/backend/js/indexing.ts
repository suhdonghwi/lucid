import * as acorn from "acorn";
import estree from "estree";
import { walk } from "estree-walker";

import { LocRange } from "@/trace/LocRange";

export type NodeWithIndex = acorn.Node & { index: number };
export type IndexedAST = NodeWithIndex[];

// 'Indexing an AST' is the process of...
// - Walking the AST, while storing nodes in an array
// - Adding an 'index' property to each node, which is the index of the node in the array
export function indexAST(ast: acorn.Program): IndexedAST {
  const indexedAST: IndexedAST = [];

  walk(ast as estree.Program, {
    enter(node) {
      // @ts-expect-error index is not a valid property on estree nodes
      node.index = indexedAST.length;

      indexedAST.push(node as NodeWithIndex);
    },
  });

  return indexedAST;
}

export function locRange(node: NodeWithIndex, sourceIndex: number): LocRange {
  return {
    sourceIndex,
    start: node.start,
    end: node.end,
  };
}
