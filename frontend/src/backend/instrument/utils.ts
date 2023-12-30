import estree from "estree";

import identifiers from "./identifiers";

export const makeEventCallStatement = (
  event: string,
  args: estree.Expression[],
): estree.ExpressionStatement => ({
  type: "ExpressionStatement",
  expression: {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: identifiers.callbackModule,
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

export const makeImportStatement = ({
  identifier,
  source,
}: {
  identifier: string;
  source: string;
}): estree.ImportDeclaration => ({
  type: "ImportDeclaration",
  specifiers: [
    {
      type: "ImportDefaultSpecifier",
      local: {
        type: "Identifier",
        name: identifier,
      },
    },
  ],
  source: {
    type: "Literal",
    value: source,
  },
});
