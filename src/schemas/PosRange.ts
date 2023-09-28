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
    endLineno: exclude,
    col: posNumber,
    endCol: exclude,
  }),
  z.strictObject({
    lineno: posNumber,
    endLineno: exclude,
    col: exclude,
    endCol: exclude,
  }),
]);

export type PosRange = z.infer<typeof posRangeSchema>;
