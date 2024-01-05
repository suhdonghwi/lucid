import * as acorn from "acorn";

import { walk } from "estree-walker";
import estree from "estree";

import { generate } from "astring";

import * as utils from "./utils";

type InstrumentOptions = {
  eventCallbacksIdentifier: string;
};

export class Instrumenter {
  private options: InstrumentOptions;

  constructor(options: InstrumentOptions) {
    this.options = options;
  }

  private wrapStatementsWithEnterLeaveCall({
    statements,
    nodeIndex,
  }: {
    statements: estree.Statement[];
    nodeIndex: number;
  }): estree.BlockStatement {
    const enterCall = utils.makeEventCallStatement(
      this.options.eventCallbacksIdentifier,
      "onFunctionEnter",
      [utils.makeLiteral(nodeIndex)],
    );

    const leaveCall = utils.makeEventCallStatement(
      this.options.eventCallbacksIdentifier,
      "onFunctionLeave",
      [utils.makeLiteral(nodeIndex)],
    );

    return {
      type: "BlockStatement",
      body: [
        enterCall,
        {
          type: "TryStatement",
          block: {
            type: "BlockStatement",
            body: statements,
          },
          finalizer: {
            type: "BlockStatement",
            body: [leaveCall],
          },
        },
      ],
    };
  }

  instrument(code: string) {
    const originalAST = acorn.parse(code, {
      ecmaVersion: 2024,
    }) as estree.Program;
    const postOrderedNodes = postOrderNodes(originalAST);

    const instrumentedAST = JSON.parse(JSON.stringify(originalAST));

    let postOrderIndex = 0;
    walk(instrumentedAST, {
      leave: (node) => {
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

          node.body = this.wrapStatementsWithEnterLeaveCall({
            statements: functionBody,
            nodeIndex: postOrderIndex,
          });
        }

        postOrderIndex += 1;
      },
    });

    return {
      result: generate(instrumentedAST),
      indexedNodes: postOrderedNodes,
    };
  }
}

function postOrderNodes(ast: estree.Program): estree.Node[] {
  const nodes: estree.Node[] = [];
  walk(ast, {
    leave(node) {
      nodes.push(node);
    },
  });

  return nodes;
}

export type { EventCallbacks } from "./eventCallbacks";
