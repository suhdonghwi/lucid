import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import events from "./events";
import * as utils from "./utils";

const wrapBlockWithEnterLeaveCall = (
  block: estree.BlockStatement,
): estree.BlockStatement => ({
  type: "BlockStatement",
  body: [
    utils.makeCallExpressionStatement(events.FUNCTION_ENTER, []),
    {
      type: "TryStatement",
      block,
      finalizer: {
        type: "BlockStatement",
        body: [utils.makeCallExpressionStatement(events.FUNCTION_LEAVE, [])],
      },
    },
  ],
});

export function instrument(code: string, eventCallbackModuleURL: string) {
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

  program.body.unshift(
    utils.makeImportStatement({
      identifier: "eventCallback",
      source: eventCallbackModuleURL,
    }),
  );

  return generate(program);
}
