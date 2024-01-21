import { TraceManager } from "@/trace";

import { execute } from "./execute";
import { EventCallbacks, IndexedAST, NodeWithIndex } from "../instrument";

export async function generateTrace(code: string) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (indexedAST: IndexedAST): EventCallbacks => ({
    onFunctionEnter: (nodeIndex) => {
      const node = indexedAST[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: locRange(callerNode),
        callee: locRange(calleeNode),
        innerTrace: [],
      });
    },

    onFunctionLeave: (nodeIndex) => {
      const node = indexedAST[nodeIndex];
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (nodeIndex) => {
      const node = indexedAST[nodeIndex];
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (nodeIndex, value) => {
      const node = indexedAST[nodeIndex];
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await execute(code, createEventCallbacks);

  return traceManager.getCurrentTrace();
}
