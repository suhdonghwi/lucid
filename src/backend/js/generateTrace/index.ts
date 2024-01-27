import * as acorn from "acorn";
import { generate } from "astring";

import { TraceManager } from "@/trace";
import { Repository, RepositoryFile } from "@/repository";

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
    instrumentedRepo.addFile({ path: file.path, content: instrumentedCode });

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
  const traceManager = new TraceManager();

  const { result: instrumentedRepo, indexedRepo } = instrumentRepo(repo, eventCallbacksIdentifier);

  const eventCallbacks: EventCallbacks = {
    onFunctionEnter: (sourceIndex, nodeIndex) => {
      const { file, indexedAST } = indexedRepo[sourceIndex];
      const node = indexedAST[nodeIndex];

      const callerNode = expressionStack[expressionStack.length - 1];
      const calleeNode = node;

      traceManager.newDepth({
        type: "function_call",
        caller: {
          file,
          start: callerNode.start,
          end: callerNode.end,
        },
        callee: {
          file,
          start: calleeNode.start,
          end: calleeNode.end,
        },
        innerTrace: [],
      });
    },

    onFunctionLeave: (sourceIndex, nodeIndex) => {
      // const node = indexedRepo[sourceIndex].indexedAST[nodeIndex];
      // console.log("function leave", node);

      traceManager.finishDepth();
    },

    onExpressionEnter: (sourceIndex, nodeIndex) => {
      const node = indexedRepo[sourceIndex].indexedAST[nodeIndex];
      // console.log("expression enter", node);

      expressionStack.push(node);
    },

    onExpressionLeave: (sourceIndex, nodeIndex, value) => {
      // const node = indexedRepo[sourceIndex].indexedAST[nodeIndex];
      // console.log("expression leave", node);

      expressionStack.pop();

      return value;
    },
  };

  await execute(instrumentedRepo, eventCallbacks, eventCallbacksIdentifier);

  return traceManager.getCurrentTrace();
}
