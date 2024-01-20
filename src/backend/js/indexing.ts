import * as acorn from "acorn";
import estree from "estree";
import { walk } from "estree-walker";

import { LocRange } from "@/trace/LocRange";

export type NodeWithIndex = acorn.Node & { index: number; sourceIndex: number };
export type IndexedAST = NodeWithIndex[];

// 'Indexing an AST' is the process of...
// - Walking the AST, while storing nodes in an array
// - Adding an 'index' property to each node, which is the index of the node in the array
// - Adding a 'sourceIndex' property to each node, which is the index of the source file
export function indexAST(ast: acorn.Program, sourceIndex: number): IndexedAST {
  const indexedAST: IndexedAST = [];

  walk(ast as estree.Program, {
    enter(node) {
      // @ts-expect-error index is not a valid property on estree nodes
      node.index = indexedAST.length;

      // @ts-expect-error sourceIndex is not a valid property on estree nodes
      node.sourceIndex = sourceIndex;

      indexedAST.push(node as NodeWithIndex);
    },
  });

  return indexedAST;
}

export function locRange(node: NodeWithIndex): LocRange {
  return {
    sourceIndex: node.sourceIndex,
    start: node.start,
    end: node.end,
  };
}
