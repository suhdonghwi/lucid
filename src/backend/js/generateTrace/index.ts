import { TraceManager } from "@/trace";

import { execute } from "./execute";
import { EventCallbacks } from "../instrument";
import { NodeWithIndex, codeRange } from "../indexing";

export async function generateTrace(code: string) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (
    indexedNodes: NodeWithIndex[],
  ): EventCallbacks => ({
    onFunctionEnter: (nodeIndex) => {
      const node = indexedNodes[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: codeRange(callerNode),
        callee: codeRange(calleeNode),
        innerTrace: [],
      });
    },

    onFunctionLeave: (nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (nodeIndex, value) => {
      const node = indexedNodes[nodeIndex];
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await execute(code, createEventCallbacks);

  return traceManager.getCurrentTrace();
}
