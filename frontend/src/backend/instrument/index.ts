import * as acorn from "acorn";

import { walk } from "estree-walker";
import * as estree from "estree";

import { generate } from "astring";

import * as constants from "./constants";

const wrapBlockWithEnterLeaveCall = (
  block: estree.BlockStatement,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: constants.FUNCTION_ENTER,
        },
        arguments: [],
        optional: false,
      },
    },
    {
      type: "TryStatement",
      block,
      finalizer: {
        type: "BlockStatement",
        body: [
          {
            type: "ExpressionStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: constants.FUNCTION_LEAVE,
              },
              arguments: [],
              optional: false,
            },
          },
        ],
      },
    },
  ],
});

export function instrument(code: string) {
  const program = acorn.parse(code, { ecmaVersion: 2024 });

  walk(program as estree.Node, {
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
        node.body = wrapBlockWithEnterLeaveCall(blockizedBody);
      }
    },
  });

  return generate(program);
}
