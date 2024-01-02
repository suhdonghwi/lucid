import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import * as utils from "./utils";

const wrapBlockWithEnterLeaveCall = (
  eventCallbacksIdentifier: string,
  block: estree.BlockStatement,
  nodeIndex: number,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    utils.makeEventCallStatement(eventCallbacksIdentifier, "onFunctionEnter", [
      utils.makeLiteral(nodeIndex),
    ]),
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
});

type InstrumentOptions = {
  eventCallbacksIdentifier: string;
};

export function instrument(code: string, options: InstrumentOptions) {
  const originalAST = acorn.parse(code, {
    ecmaVersion: 2024,
  }) as estree.Program;

  const indexedNodes: estree.Node[] = [];
  walk(originalAST, {
    leave(node) {
      indexedNodes.push(node);
    },
  });

  const instrumentedAST = JSON.parse(JSON.stringify(originalAST));

  let leavingOrder = 0;
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

        node.body = wrapBlockWithEnterLeaveCall(
          options.eventCallbacksIdentifier,
          blockizedBody,
          leavingOrder,
        );
      }

      leavingOrder += 1;
    },
  });

  return {
    result: generate(instrumentedAST),
    indexedNodes,
  };
}

export type { EventCallbacks } from "./eventCallbacks";
