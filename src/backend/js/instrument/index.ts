import * as acorn from "acorn";
import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import { InstrumentOptions } from "./options";
import { indexAST } from "../indexing";
import {
  wrapExpressionWithEnterLeaveCall,
  wrapStatementsWithEnterLeaveCall,
} from "./nodeTransforms";

export function instrument(code: string, options: InstrumentOptions) {
  const originalAST = acorn.parse(code, {
    ecmaVersion: 2024,
  });
  const indexedAST = indexAST(originalAST, options.sourceIndex);

  const instrumentedAST: acorn.Program = JSON.parse(
    JSON.stringify(originalAST),
  );

  walk(instrumentedAST as estree.Program, {
    enter(node) {
      if (node.type === "Literal" || node.type === "Identifier") {
        this.skip();
      }
    },
    leave(node) {
      // @ts-expect-error index is not a valid property on estree nodes
      const nodeIndex: number = node.index;

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

          enterEvent: "onFunctionEnter",
          leaveEvent: "onFunctionLeave",

          statements: functionBody,
          nodeIndex,
        });
      }

      if (isExpression(node)) {
        this.replace(
          wrapExpressionWithEnterLeaveCall({
            eventCallbacksIdentifier: options.eventCallbacksIdentifier,

            enterEvent: "onExpressionEnter",
            leaveEvent: "onExpressionLeave",

            expression: node,
            nodeIndex,
          }),
        );
      }
    },
  });

  return {
    result: generate(instrumentedAST),
    indexedAST,
  };
}

function isExpression(node: estree.Node): node is estree.Expression {
  return (
    node.type.endsWith("Expression") ||
    node.type === "Identifier" ||
    node.type === "Literal" ||
    node.type === "TemplateLiteral"
  );
}

export type { EventCallbacks } from "./eventCallbacks";
