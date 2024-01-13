import estree from "estree";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks } from "../instrument";

export async function execute(code: string) {
  const expressionStack: estree.Node[] = [];

  const createEventCallbacks = (
    indexedNodes: estree.Node[],
  ): EventCallbacks => ({
    onFunctionEnter: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      console.log("function enter", node);
    },
    onFunctionLeave: (sourceFileIndex, nodeIndex) => {
      const node = indexedNodes[nodeIndex];
      console.log("function leave", node);
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

  return executeWithCallbacks(code, createEventCallbacks);
}
