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

function makeEventCall({
  eventCallbacksIdentifier,
  event,
  args,
}: {
  eventCallbacksIdentifier: string;
  event: keyof EventCallbacks;
  args: estree.Expression[];
}): estree.CallExpression {
  return {
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
  };
}

export function wrapStatementsWithEnterLeaveCall({
  eventCallbacksIdentifier,

  enterEvent,
  leaveEvent,

  statements,

  sourceIndex,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;

  enterEvent: keyof EventCallbacks;
  leaveEvent: keyof EventCallbacks;

  statements: estree.Statement[];

  sourceIndex: number;
  nodeIndex: number;
}): estree.BlockStatement {
  const callArgs = [makeLiteral(sourceIndex), makeLiteral(nodeIndex)];

  const enterCallStatement: estree.ExpressionStatement = {
    type: "ExpressionStatement",
    expression: makeEventCall({
      eventCallbacksIdentifier,
      event: enterEvent,
      args: callArgs,
    }),
  };

  const leaveCallStatement: estree.ExpressionStatement = {
    type: "ExpressionStatement",
    expression: makeEventCall({
      eventCallbacksIdentifier,
      event: leaveEvent,
      args: callArgs,
    }),
  };

  return {
    type: "BlockStatement",
    body: [
      enterCallStatement,
      {
        type: "TryStatement",
        block: {
          type: "BlockStatement",
          body: statements,
        },
        finalizer: {
          type: "BlockStatement",
          body: [leaveCallStatement],
        },
      },
    ],
  };
}

export function wrapExpressionWithEnterLeaveCall({
  eventCallbacksIdentifier,

  enterEvent,
  leaveEvent,

  expression,

  sourceIndex,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;

  enterEvent: keyof EventCallbacks;
  leaveEvent: keyof EventCallbacks;

  expression: estree.Expression;

  sourceIndex: number;
  nodeIndex: number;
}): estree.Expression {
  const callArgs = [makeLiteral(sourceIndex), makeLiteral(nodeIndex)];

  const enterCall = makeEventCall({
    eventCallbacksIdentifier,
    event: enterEvent,
    args: callArgs,
  });

  const leaveCall = makeEventCall({
    eventCallbacksIdentifier,
    event: leaveEvent,
    args: [...callArgs, expression],
  });

  return {
    type: "SequenceExpression",
    expressions: [enterCall, leaveCall],
  };
}
