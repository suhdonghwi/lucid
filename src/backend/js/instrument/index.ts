import * as acorn from "acorn";
import { walk } from "estree-walker";
import estree from "estree";

import { assert } from "@/utils/assert";

import { Repository } from "@/repository";

import { InstrumentOptions } from "./options";
import {
  wrapExpressionWithEnterLeaveCall,
  wrapStatementsWithEnterLeaveCall,
} from "./nodeTransforms";

export type IndexedRepository = { path: string; indexedAST: IndexedAST }[];

export type NodeWithIndex = acorn.Node & { index: number };
export type IndexedAST = NodeWithIndex[];

export function instrumentRepository(
  parsedRepo: Repository<acorn.Program>,
  options: InstrumentOptions,
) {
  const indexedRepo: IndexedRepository = [];
  const instrumentedRepo: Repository<acorn.Program> = new Map();

  for (const [path, parsedCode] of parsedRepo.entries()) {
    const { result: instrumentedAST, indexedAST } = instrument(
      parsedCode,
      indexedRepo.length,
      options,
    );

    indexedRepo.push({ path, indexedAST });
    instrumentedRepo.set(path, instrumentedAST);
  }

  return { result: instrumentedRepo, indexedRepo };
}

function instrument(
  originalAST: acorn.Program,
  sourceIndex: number,
  options: InstrumentOptions,
) {
  const instrumentedAST: acorn.Program = structuredClone(originalAST);
  const indexedAST: NodeWithIndex[] = [];

  walk(instrumentedAST as estree.Program, {
    enter(node) {
      if (node.type === "Literal" || node.type === "Identifier") {
        this.skip();
        return;
      }

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

          sourceIndex,
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

            sourceIndex,
            nodeIndex,
          }),
        );
      }
    },
  });

  return { result: instrumentedAST, indexedAST };
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

function isExpression(node: estree.Node): node is estree.Expression {
  return (
    node.type.endsWith("Expression") ||
    node.type === "Identifier" ||
    node.type === "Literal" ||
    node.type === "TemplateLiteral"
  );
}

export type { EventCallbacks } from "./eventCallbacks";
