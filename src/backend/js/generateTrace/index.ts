import * as acorn from "acorn";
import { generate } from "astring";

import { TraceManager } from "@/trace";
import { Repository, RepositoryFile } from "@/repository";

import { execute } from "./execute";
import { EventCallbacks, NodeWithIndex, instrument } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

function instrumentRepo(repo: Repository) {
  const instrumentedRepo = new Repository();
  const indexedRepo: {
    file: RepositoryFile;
    getNodeByIndex: (nodeIndex: number) => NodeWithIndex;
  }[] = [];

  for (const file of repo.files()) {
    const ast = acorn.parse(file.content, { ecmaVersion: "latest" });

    const { result: instrumentedAST, getNodeByIndex } = instrument(ast, {
      sourceIndex: indexedRepo.length,
      eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
    });

    const instrumentedCode = generate(instrumentedAST);
    instrumentedRepo.addFile({ path: file.path, content: instrumentedCode });

    indexedRepo.push({
      file,
      getNodeByIndex,
    });
  }

  return {
    result: instrumentedRepo,
    getNodeByIndex: (sourceIndex: number, nodeIndex: number) => {
      const { file, getNodeByIndex } = indexedRepo[sourceIndex];
      return { file, node: getNodeByIndex(nodeIndex) };
    },
  };
}

export async function generateTrace(repo: Repository) {
  const expressionStack: NodeWithIndex[] = [];
  const traceManager = new TraceManager();

  const { result: instrumentedRepo, getNodeByIndex } = instrumentRepo(repo);

  const eventCallbacks: EventCallbacks = {
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const { node } = getNodeByIndex(sourceIndex, nodeIndex);

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
      const { node } = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const { node } = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      const { node } = getNodeByIndex(sourceIndex, nodeIndex);
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  };

  await execute(instrumentedRepo, eventCallbacks, EVENT_CALLBACKS_IDENTIFIER);

  return traceManager.getCurrentTrace();
}
