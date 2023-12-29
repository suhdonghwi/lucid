import * as acorn from "acorn";

import { walk } from "estree-walker";
import type { Node, Statement } from "estree";

import { generate } from "astring";

// NOTE:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ea1de09d62f7945dee2aac098fa3969ab60645a8/types/estree/index.d.ts#L103-L123
function isStatement(node: Node): node is Statement {
  return (
    node.type.endsWith("Statement") ||
    node.type === "ClassDeclaration" ||
    node.type === "FunctionDeclaration" ||
    node.type === "VariableDeclaration"
  );
}

export function instrument(code: string) {
  const program = acorn.parse(code, { ecmaVersion: 2024 });

  walk(program as Node, {
    leave(node) {
      if (isStatement(node) && node.type !== "BlockStatement") {
        this.replace({
          type: "TryStatement",
          block: {
            type: "BlockStatement",
            body: [node],
          },
          finalizer: {
            type: "BlockStatement",
            body: [],
          },
        });
      }
    },
  });

  return generate(program);
}
