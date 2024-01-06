import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import { InstrumentOptions } from "./options";
import { wrapStatementsWithEnterLeaveCall } from "./nodeTransforms";

export function instrument(code: string, options: InstrumentOptions) {
  const originalAST = acorn.parse(code, {
    ecmaVersion: 2024,
  }) as estree.Program;
  const postOrderedNodes = postOrderNodes(originalAST);

  const instrumentedAST = JSON.parse(JSON.stringify(originalAST));

  let postOrderIndex = 0;
  walk(instrumentedAST, {
    leave: (node) => {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        const functionBody: estree.Statement[] =
          node.body.type === "BlockStatement"
            ? node.body.body
            : [
                {
                  type: "ReturnStatement",
                  argument: node.body,
                },
              ];

        node.body = wrapStatementsWithEnterLeaveCall({
          eventCallbacksIdentifier: options.eventCallbacksIdentifier,
          sourceFileIndex: options.sourceFileIndex,

          statements: functionBody,
          nodeIndex: postOrderIndex,
        });
      }

      postOrderIndex += 1;
    },
  });

  return {
    result: generate(instrumentedAST),
    indexedNodes: postOrderedNodes,
  };
}

function postOrderNodes(ast: estree.Program): estree.Node[] {
  const nodes: estree.Node[] = [];
  walk(ast, {
    leave(node) {
      nodes.push(node);
    },
  });

  return nodes;
}

export type { EventCallbacks } from "./eventCallbacks";
