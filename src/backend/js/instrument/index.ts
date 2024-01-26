import * as acorn from "acorn";
import { walk } from "estree-walker";
import estree from "estree";

import { assert } from "@/utils/assert";

import { InstrumentOptions } from "./options";
import {
  wrapExpressionWithEnterLeaveCall,
  wrapStatementsWithEnterLeaveCall,
} from "./nodeTransforms";

type NodeWithIndex = acorn.Node & { index: number };

export function instrument(
  originalAST: acorn.Program,
  options: InstrumentOptions,
) {
  const instrumentedAST: acorn.Program = structuredClone(originalAST);
  const indexedAST: NodeWithIndex[] = [];

  walk(instrumentedAST as estree.Program, {
    enter(node) {
      // @ts-expect-error index is not a valid property on estree nodes
      node.index = indexedAST.length;
      indexedAST.push(node as NodeWithIndex);
    },
    leave(node) {
      const nodeWithIndex = node as NodeWithIndex;
      assert(nodeWithIndex.index !== undefined, "Node has no index property");

      const nodeIndex = nodeWithIndex.index;

      if (isFunction(node)) {
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

          sourceIndex: options.sourceIndex,
          nodeIndex,
        });
      }

      if (isNonTrivialExpression(node)) {
        this.replace(
          wrapExpressionWithEnterLeaveCall({
            eventCallbacksIdentifier: options.eventCallbacksIdentifier,

            enterEvent: "onExpressionEnter",
            leaveEvent: "onExpressionLeave",

            expression: node,

            sourceIndex: options.sourceIndex,
            nodeIndex,
          }),
        );
      }
    },
  });

  return {
    result: instrumentedAST,
    indexedAST,
  };
}

function isFunction(
  node: estree.Node,
): node is
  | estree.FunctionDeclaration
  | estree.FunctionExpression
  | estree.ArrowFunctionExpression {
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

// Non-trivial expressions are expressions that can (either directly or indirectly) call functions.
function isNonTrivialExpression(
  node: estree.Node,
): node is
  | estree.NewExpression
  | estree.CallExpression
  | estree.ChainExpression
  | estree.ImportExpression
  | estree.MemberExpression {
  return (
    node.type === "NewExpression" ||
    node.type === "CallExpression" ||
    node.type === "ChainExpression" ||
    node.type === "ImportExpression" ||
    node.type === "MemberExpression"
  );
}

export type { EventCallbacks } from "./eventCallbacks";
