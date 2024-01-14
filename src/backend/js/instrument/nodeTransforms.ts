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
  sourceFileIndex,

  enterEvent,
  leaveEvent,

  statements,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;
  sourceFileIndex: number;

  enterEvent: keyof EventCallbacks;
  leaveEvent: keyof EventCallbacks;

  statements: estree.Statement[];
  nodeIndex: number;
}): estree.BlockStatement {
  const callArgs = [makeLiteral(sourceFileIndex), makeLiteral(nodeIndex)];

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
  sourceFileIndex,

  enterEvent,
  leaveEvent,

  expression,
  nodeIndex,
}: {
  eventCallbacksIdentifier: string;
  sourceFileIndex: number;

  enterEvent: keyof EventCallbacks;
  leaveEvent: keyof EventCallbacks;

  expression: estree.Expression;
  nodeIndex: number;
}): estree.Expression {
  const callArgs = [makeLiteral(sourceFileIndex), makeLiteral(nodeIndex)];

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
