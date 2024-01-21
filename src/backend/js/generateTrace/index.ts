import { TraceManager } from "@/trace";

import { execute } from "./execute";
import { EventCallbacks, NodeWithIndex } from "../instrument";
import { Repository } from "@/repository";

export async function generateTrace(repo: Repository) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const createEventCallbacks = (
    getNodeByIndex: (sourceIndex: number, nodeIndex: number) => NodeWithIndex,
  ): EventCallbacks => ({
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const node = getNodeByIndex(sourceIndex, nodeIndex);

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: {
          sourceIndex,
          start: callerNode.start,
          end: callerNode.end,
        },
        callee: {
          sourceIndex,
          start: calleeNode.start,
          end: calleeNode.end,
        },
        innerTrace: [],
      });
    },

    onFunctionLeave: (sourceIndex, nodeIndex) => {
      const node = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const node = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      const node = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  });

  await execute(repo, createEventCallbacks);

  return traceManager.getCurrentTrace();
}
