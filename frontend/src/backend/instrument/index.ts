import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import * as utils from "./utils";

const wrapBlockWithEnterLeaveCall = (
  block: estree.BlockStatement,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    utils.makeEventCallStatement("onFunctionEnter", []),
    {
      type: "TryStatement",
      block,
      finalizer: {
        type: "BlockStatement",
        body: [utils.makeEventCallStatement("onFunctionLeave", [])],
      },
    },
  ],
});

export function instrument(code: string) {
  const program = acorn.parse(code, { ecmaVersion: 2024 }) as estree.Program;

  walk(program, {
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
