import { z } from "zod";

const posNumber = z.number().int().nonnegative();
// const exclude = z.never().optional();

export const posRangeSchema = z.strictObject({
  lineno: posNumber,
  endLineno: posNumber,
  col: posNumber,
  endCol: posNumber,
});

export type PosRange = z.infer<typeof posRangeSchema>;
