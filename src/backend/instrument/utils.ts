import estree from "estree";

import { EventCallbacks } from "./eventCallbacks";

export const makeEventCallStatement = (
  eventCallbacksIdentifier: string,
  event: keyof EventCallbacks,
  args: estree.Expression[],
): estree.ExpressionStatement => ({
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
          name: eventCallbacksIdentifier,
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
});

export const makeLiteral = (
  value: string | number | boolean,
): estree.Literal => ({
  type: "Literal",
  value,
});
