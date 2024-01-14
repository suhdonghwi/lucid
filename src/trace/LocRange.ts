import * as acorn from "acorn";

/*
 * Location Range of a code
 *  `start` represents the starting byte index of the code
 *  `end` represents the ending byte index of the code, exclusive
 */
export type LocRange = {
  sourceIndex: number;
  start: number;
  end: number;
};

export function locRange(node: acorn.Node, sourceIndex: number): LocRange {
  return {
    sourceIndex,
    start: node.start,
    end: node.end,
  };
}
