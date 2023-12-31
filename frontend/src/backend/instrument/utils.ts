import estree from "estree";

import * as identifiers from "./identifiers";
import { EventCallbacks } from "./eventCallbacks";

export const makeEventCallStatement = (
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
          name: identifiers.eventCallbacks,
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
