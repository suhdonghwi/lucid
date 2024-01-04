import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import * as utils from "./utils";

function wrapBlockWithEnterLeaveCall({
  eventCallbacksIdentifier,
  block,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;
  block: estree.BlockStatement;
  nodeIndex: number;
}): estree.BlockStatement {
  return {
    type: "BlockStatement",
    body: [
      utils.makeEventCallStatement(
        eventCallbacksIdentifier,
        "onFunctionEnter",
        [utils.makeLiteral(nodeIndex)],
      ),
      {
        type: "TryStatement",
        block,
        finalizer: {
          type: "BlockStatement",
          body: [
            utils.makeEventCallStatement(
              eventCallbacksIdentifier,
              "onFunctionLeave",
              [utils.makeLiteral(nodeIndex)],
            ),
          ],
        },
      },
    ],
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

type InstrumentOptions = {
  eventCallbacksIdentifier: string;
};

export function instrument(code: string, options: InstrumentOptions) {
  const originalAST = acorn.parse(code, {
    ecmaVersion: 2024,
  }) as estree.Program;

  const postOrderedNodes = postOrderNodes(originalAST);

  const instrumentedAST = JSON.parse(JSON.stringify(originalAST));

  let postOrderIndex = 0;
  walk(instrumentedAST, {
    leave(node) {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        const blockizedBody: estree.BlockStatement =
          node.body.type === "BlockStatement"
            ? node.body
            : {
                type: "BlockStatement",
                body: [
                  {
                    type: "ReturnStatement",
                    argument: node.body,
                  },
                ],
              };

        node.body = wrapBlockWithEnterLeaveCall({
          eventCallbacksIdentifier: options.eventCallbacksIdentifier,
          block: blockizedBody,
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

export type { EventCallbacks } from "./eventCallbacks";
