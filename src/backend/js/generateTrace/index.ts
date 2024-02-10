import * as acorn from "acorn";
import { generate } from "astring";

import { TraceManager } from "@/data/trace";
import { Repository, RepositoryFile } from "@/data/repository";

import { execute } from "./execute";
import { EventCallbacks, instrument } from "../instrument";

function instrumentRepo(repo: Repository, eventCallbacksIdentifier: string) {
  const instrumentedRepo = new Repository();
  const indexedRepo: {
    file: RepositoryFile;
    indexedAST: acorn.Node[];
  }[] = [];

  for (const file of repo.files()) {
    const ast = acorn.parse(file.content, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    const { result: instrumentedAST, indexedAST } = instrument(ast, {
      sourceIndex: indexedRepo.length,
      eventCallbacksIdentifier,
    });

    const instrumentedCode = generate(instrumentedAST);
    instrumentedRepo.setContent(file.path, instrumentedCode);

    indexedRepo.push({
      file,
      indexedAST,
    });
  }

  return {
    result: instrumentedRepo,
    indexedRepo,
  };
}

export async function generateTrace(repo: Repository) {
  const eventCallbacksIdentifier = "evc";

  const expressionStack: acorn.Node[] = [];
  const traceManager = new TraceManager({
    path: "/index.js",
    locationRange: {
      start: 0,
      end: 0,
    },
    children: [],
  });

  const { result: instrumentedRepo, indexedRepo } = instrumentRepo(
    repo,
    eventCallbacksIdentifier,
  );

  const eventCallbacks: EventCallbacks = {
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const { file, indexedAST } = indexedRepo[sourceIndex];
      const node = indexedAST[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.startChildTrace({
        source: {
          start: callerNode.start,
          end: calleeNode.end,
        },
        trace: {
          path: file.path,
          locationRange: {
            start: calleeNode.start,
            end: calleeNode.end,
          },
          children: [],
        },
      });
    },

    onFunctionLeave: (sourceIndex, nodeIndex) => {
      traceManager.finishCurrentTrace();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedRepo[sourceIndex].indexedAST[nodeIndex];

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      expressionStack.pop();

      return value;
    },

    onConsoleLog: (message) => {
      const consoleLogNode = expressionStack[expressionStack.length - 1];

      traceManager.addChildLog({
        source: {
          start: consoleLogNode.start,
          end: consoleLogNode.end,
        },
        message,
      });
    },
  };

  await execute(instrumentedRepo, eventCallbacks, eventCallbacksIdentifier);

  return traceManager.getCurrentTrace();
}
