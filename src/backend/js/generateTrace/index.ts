import * as acorn from "acorn";
import { generate } from "astring";

import { TraceManager } from "@/trace";
import { Repository } from "@/repository";

import { execute } from "./execute";
import { EventCallbacks, NodeWithIndex, instrument } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

function instrumentRepo(repo: Repository) {
  const instrumentedRepo: Repository = new Map();
  const indexedRepo = [];

  for (const [path, code] of repo.entries()) {
    const ast = acorn.parse(code, { ecmaVersion: "latest" });

    const { result: instrumentedAST, getNodeByIndex } = instrument(ast, {
      sourceIndex: indexedRepo.length,
      eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
    });

    const instrumentedCode = generate(instrumentedAST);
    instrumentedRepo.set(path, instrumentedCode);

    indexedRepo.push({
      path,
      getNodeByIndex,
    });
  }

  return {
    result: instrumentedRepo,
    indexedRepo,
  };
}

export async function generateTrace(repo: Repository) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const { result: instrumentedRepo, indexedRepo } = instrumentRepo(repo);

  const eventCallbacks: EventCallbacks = {
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedRepo[sourceIndex].getNodeByIndex(nodeIndex);

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
      const node = indexedRepo[sourceIndex].getNodeByIndex(nodeIndex);
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedRepo[sourceIndex].getNodeByIndex(nodeIndex);
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      const node = indexedRepo[sourceIndex].getNodeByIndex(nodeIndex);
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  };

  await execute(instrumentedRepo, eventCallbacks, EVENT_CALLBACKS_IDENTIFIER);

  return traceManager.getCurrentTrace();
}
