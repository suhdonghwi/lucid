import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import { InstrumentOptions } from "./options";
import {
  wrapExpressionWithEnterLeaveCall,
  wrapStatementsWithEnterLeaveCall,
} from "./nodeTransforms";

function isExpression(node: estree.Node): node is estree.Expression {
  return (
    node.type.endsWith("Expression") ||
    node.type === "Identifier" ||
    node.type === "Literal" ||
    node.type === "TemplateLiteral"
  );
}

export function instrument(code: string, options: InstrumentOptions) {
  const originalAST = acorn.parse(code, {
    ecmaVersion: 2024,
  }) as estree.Program;
  const postOrderedNodes = sortNodesInPostOrder(originalAST);

  const instrumentedAST: estree.Program = JSON.parse(
    JSON.stringify(originalAST),
  );

  const skippingNodes = new Set<estree.Node>();
  let postOrderIndex = 0;

  walk(instrumentedAST, {
    enter(node) {
      switch (node.type) {
        case "VariableDeclarator":
          skippingNodes.add(node.id);
          break;
        case "MemberExpression":
          skippingNodes.add(node.property);
          break;
      }
    },
    leave(node) {
      if (skippingNodes.has(node)) {
        this.skip();
        return;
      }

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

          enterEvent: "onFunctionEnter",
          leaveEvent: "onFunctionLeave",

          statements: functionBody,
          nodeIndex: postOrderIndex,
        });
      }

      if (isExpression(node)) {
        this.replace(
          wrapExpressionWithEnterLeaveCall({
            eventCallbacksIdentifier: options.eventCallbacksIdentifier,
            sourceFileIndex: options.sourceFileIndex,

            enterEvent: "onExpressionEnter",
            leaveEvent: "onExpressionLeave",

            expression: node,
            nodeIndex: postOrderIndex,
          }),
        );
      }

      postOrderIndex += 1;
    },
  });

  return {
    result: generate(instrumentedAST),
    indexedNodes: postOrderedNodes,
  };
}

function sortNodesInPostOrder(ast: estree.Program): estree.Node[] {
  const nodes: estree.Node[] = [];
  walk(ast, {
    leave(node) {
      nodes.push(node);
    },
  });

  return nodes;
}

export type { EventCallbacks } from "./eventCallbacks";
