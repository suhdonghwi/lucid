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
