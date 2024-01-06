import estree from "estree";

import { InstrumentOptions } from "./options";
import { EventCallbacks } from "./eventCallbacks";

export class NodeCreator {
  private options: InstrumentOptions;

  constructor(options: InstrumentOptions) {
    this.options = options;
  }

  makeEventCallStatement(
    event: keyof EventCallbacks,
    args: estree.Expression[],
  ): estree.ExpressionStatement {
    return {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: {
            type: "MemberExpression",
            object: {
              type: "Identifier",
              name: "globalThis",
            },
            property: {
              type: "Identifier",
              name: this.options.eventCallbacksIdentifier,
            },
            computed: false,
            optional: false,
          },
          property: {
            type: "Identifier",
            name: event,
          },
          computed: false,
          optional: false,
        },
        arguments: args,
        optional: false,
      },
    };
  }

  wrapStatementsWithEnterLeaveCall({
    statements,
    nodeIndex,
  }: {
    statements: estree.Statement[];
    nodeIndex: number;
  }): estree.BlockStatement {
    const enterCall = this.makeEventCallStatement("onFunctionEnter", [
      makeLiteral(nodeIndex),
    ]);

    const leaveCall = this.makeEventCallStatement("onFunctionLeave", [
      makeLiteral(nodeIndex),
    ]);

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
}

const makeLiteral = (value: string | number | boolean): estree.Literal => ({
  type: "Literal",
  value,
});
