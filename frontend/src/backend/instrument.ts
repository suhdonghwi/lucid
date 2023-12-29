import * as acorn from "acorn";

import { walk } from "estree-walker";
import type { Node } from "estree-walker";

import { generate } from "astring";

export function instrument(code: string) {
  const program = acorn.parse(code, { ecmaVersion: 2015 });

  walk(program as Node, {
    leave(node) {
      if (node.type === "ExpressionStatement") {
        this.replace({
          type: "TryStatement",
          block: {
            type: "BlockStatement",
            body: [node],
          },
          finalizer: null,
        });
      }
    },
  });

  // console.log(program);
  console.log(generate(program));
}
