import * as acorn from "acorn";

import { TraceManager } from "@/trace";
import { locRange } from "@/trace/LocRange";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks } from "../instrument";

export async function execute(code: string) {
  const expressionStack: acorn.Node[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (
    indexedNodes: acorn.Node[],
  ): EventCallbacks => ({
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: locRange(callerNode, sourceIndex),
        callee: locRange(calleeNode, sourceIndex),
        innerTrace: [],
      });
    },

    onFunctionLeave: (sourceIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await executeWithCallbacks(code, createEventCallbacks);

  return traceManager.getCurrentTrace();
}
