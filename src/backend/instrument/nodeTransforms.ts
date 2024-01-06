import estree from "estree";

import { EventCallbacks } from "./eventCallbacks";

const makeLiteral = (value: string | number | boolean): estree.Literal => ({
  type: "Literal",
  value,
});

function makeEventCallbacksExpression(
  eventCallbacksIdentifier: string,
): estree.MemberExpression {
  return {
    type: "MemberExpression",
    object: {
      type: "Identifier",
      name: "globalThis",
    },
    property: {
      type: "Identifier",
      name: eventCallbacksIdentifier,
    },
    computed: false,
    optional: false,
  };
}

function makeEventCallStatement({
  eventCallbacksIdentifier,
  event,
  args,
}: {
  eventCallbacksIdentifier: string;
  event: keyof EventCallbacks;
  args: estree.Expression[];
}): estree.ExpressionStatement {
  return {
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: makeEventCallbacksExpression(eventCallbacksIdentifier),
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

export function wrapStatementsWithEnterLeaveCall({
  eventCallbacksIdentifier,
  sourceFileIndex,

  statements,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;
  sourceFileIndex: number;

  statements: estree.Statement[];
  nodeIndex: number;
}): estree.BlockStatement {
  const callArgs = [makeLiteral(sourceFileIndex), makeLiteral(nodeIndex)];

  const enterCall = makeEventCallStatement({
    eventCallbacksIdentifier,
    event: "onFunctionEnter",
    args: callArgs,
  });

  const leaveCall = makeEventCallStatement({
    eventCallbacksIdentifier,
    event: "onFunctionLeave",
    args: callArgs,
  });

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
