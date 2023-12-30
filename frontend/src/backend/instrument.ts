import * as acorn from "acorn";

import { walk } from "estree-walker";
import * as estree from "estree";

import { generate } from "astring";

const trackBlockEnterLeave = (
  block: estree.BlockStatement,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    {
      type: "TryStatement",
      block,
      finalizer: {
        type: "BlockStatement",
        body: [],
      },
    },
  ],
});

const trackExpressionEnterLeave = (
  expression: estree.Expression,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    {
      type: "TryStatement",
      block: {
        type: "BlockStatement",
        body: [
          {
            type: "ReturnStatement",
            argument: expression,
          },
        ],
      },
      finalizer: {
        type: "BlockStatement",
        body: [],
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
        node.body =
          node.body.type === "BlockStatement"
            ? trackBlockEnterLeave(node.body)
            : trackExpressionEnterLeave(node.body);
      }
    },
  });

  return generate(program);
}
