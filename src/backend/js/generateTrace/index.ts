import * as acorn from "acorn";
import { generate } from "astring";

import { TraceManager } from "@/trace";
import { Repository } from "@/repository";

import { execute } from "./execute";
import { EventCallbacks, NodeWithIndex, instrument } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

function parseRepository(repo: Repository) {
  const parsedRepo: Repository<acorn.Program> = new Map();

  for (const [path, code] of repo.entries()) {
    parsedRepo.set(path, acorn.parse(code, { ecmaVersion: "latest" }));
  }

  return parsedRepo;
}

export async function generateTrace(repo: Repository) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const parsedRepo = parseRepository(repo);
  const { result: instrumentedRepo, getNodeByIndex } = instrument(parsedRepo, {
    eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
  });

  const generatedRepo: Repository = new Map();
  for (const [path, ast] of instrumentedRepo.entries()) {
    generatedRepo.set(path, generate(ast));
  }

  const eventCallbacks: EventCallbacks = {
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
  };

  await execute(generatedRepo, eventCallbacks, EVENT_CALLBACKS_IDENTIFIER);

  return traceManager.getCurrentTrace();
}
