import { z } from "zod";

const posNumber = z.number().int().nonnegative();
const exclude = z.never().optional();

export const posRangeSchema = z.union([
  z.strictObject({
    lineno: posNumber,
    endLineno: posNumber,
    col: posNumber,
    endCol: posNumber,
  }),
  z.strictObject({
    lineno: posNumber,
    endLineno: posNumber,
    col: exclude,
    endCol: exclude,
  }),
]);

export type PosRange = z.infer<typeof posRangeSchema>;

// TODO: Make use of col information
export function cropPosRange(source: string, range: PosRange) {
  const lines = source.split("\n");
  return lines.slice(range.lineno - 1, range.endLineno).join("\n");
}
