import * as acorn from "acorn";

import { TraceManager } from "@/trace";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks } from "../instrument";

export async function execute(code: string) {
  const expressionStack: acorn.Node[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (
    indexedNodes: acorn.Node[],
  ): EventCallbacks => ({
    onFunctionEnter: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];

      traceManager.newDepth({
        type: "function_call",
        caller: expressionStack[expressionStack.length - 1],
        callee: node,
        innerTrace: [],
      });
    },

    onFunctionLeave: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceFileIndex, nodeIndex, value) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await executeWithCallbacks(code, createEventCallbacks);

  return traceManager.getCurrentTrace();
}
