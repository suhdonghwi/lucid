import { TraceManager } from "@/trace";
import { locRange } from "@/trace/LocRange";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks, IndexedNode } from "../instrument";

export async function execute(code: string) {
  const expressionStack: IndexedNode[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (
    indexedNodes: IndexedNode[],
  ): EventCallbacks => ({
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: locRange(callerNode),
        callee: locRange(calleeNode),
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
