import estree from "estree";

export const makeCallExpressionStatement = (
  functionName: string,
  args: estree.Expression[],
): estree.ExpressionStatement => ({
  type: "ExpressionStatement",
  expression: {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: functionName,
    },
    arguments: args,
    optional: false,
  },
});

export const makeImportStatement = ({
  identifiers,
  source,
}: {
  identifiers: string[];
  source: string;
}): estree.ImportDeclaration => ({
  type: "ImportDeclaration",
  specifiers: identifiers.map((identifier) => ({
    type: "ImportSpecifier",
    imported: {
      type: "Identifier",
      name: identifier,
    },
    local: {
      type: "Identifier",
      name: identifier,
    },
  })),
  source: {
    type: "Literal",
    value: source,
  },
});
