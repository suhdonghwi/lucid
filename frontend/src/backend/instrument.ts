import * as acorn from "acorn";
import { walk } from "estree-walker";
import type { Node } from "estree-walker";

export function instrument(code: string) {
  const program = acorn.parse(code, { ecmaVersion: 2015 });

  walk(program as Node, {
    enter(node) {
      if (node.type === "CallExpression") {
        this.replace({
          type: "Literal",
          value: "Hello, world!",
        });
      }
    },
  });

  console.log(program);
}
