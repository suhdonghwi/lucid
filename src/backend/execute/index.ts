import estree from "estree";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks } from "../instrument";
import { ExecutionLogManager } from "./executionLog";

export async function execute(code: string) {
  const expressionStack: estree.Node[] = [];
  const logManager = new ExecutionLogManager();

  const createEventCallbacks = (
    indexedNodes: estree.Node[],
  ): EventCallbacks => ({
    onFunctionEnter: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      console.log("function enter", node);

      logManager.startLog({
        type: "function",
        caller: expressionStack[expressionStack.length - 1],
        callee: node,
        innerLog: [],
      });
    },

    onFunctionLeave: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      console.log("function leave", node);

      logManager.finishLog();
    },

    onExpressionEnter: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceFileIndex, nodeIndex, value) => {
      const node = indexedNodes[nodeIndex];
      console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await executeWithCallbacks(code, createEventCallbacks);

  return logManager.getLog();
}
