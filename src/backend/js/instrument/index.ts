import * as acorn from "acorn";
import { walk } from "estree-walker";
import estree from "estree";

import { assert } from "@/utils/assert";

import { InstrumentOptions } from "./options";
import { NodeWithIndex } from "../indexing";
import {
  wrapExpressionWithEnterLeaveCall,
  wrapStatementsWithEnterLeaveCall,
} from "./nodeTransforms";

export function instrument(
  originalAST: acorn.Program,
  options: InstrumentOptions,
) {
  const instrumentedAST: acorn.Program = structuredClone(originalAST);

  walk(instrumentedAST as estree.Program, {
    enter(node) {
      if (node.type === "Literal" || node.type === "Identifier") {
        this.skip();
      }
    },
    leave(node) {
      const nodeWithIndex = node as NodeWithIndex;
      assert(nodeWithIndex.index !== undefined, "AST is not indexed");

      const nodeIndex = nodeWithIndex.index;

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

  return instrumentedAST;
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
