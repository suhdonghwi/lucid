import estree from "estree";

import { executeWithCallbacks } from "./executeWithCallbacks";
import { EventCallbacks } from "../instrument";

export async function execute(code: string) {
  const eventCallbacks = (indexedNodes: estree.Node[]): EventCallbacks => ({
    onFunctionEnter: (sourceFileIndex, nodeIndex) => {
      console.log("function enter", indexedNodes[nodeIndex]);
    },
    onFunctionLeave: (sourceFileIndex, nodeIndex) => {
      console.log("function leave", indexedNodes[nodeIndex]);
    },
    onExpressionEnter: (sourceFileIndex, nodeIndex) => {
      console.log("expression enter", indexedNodes[nodeIndex]);
    },
    onExpressionLeave: (sourceFileIndex, nodeIndex, value) => {
      console.log("expression leave", indexedNodes[nodeIndex]);
      return value;
    },
  });

  return executeWithCallbacks(code, eventCallbacks);
}
