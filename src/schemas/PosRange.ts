import { z } from "zod";
import { camelize } from "./camelize";

const posNumber = z.number().int().gte(0);
const exclude = z.never().optional();

export const PosRangeSchema = z
  .union([
    z.object({
      lineno: posNumber,
      end_lineno: posNumber,
      col: posNumber,
      end_col: posNumber,
    }),
    z.object({
      lineno: posNumber,
      end_lineno: exclude,
      col: posNumber,
      end_col: exclude,
    }),
    z.object({
      lineno: posNumber,
      end_lineno: exclude,
      col: exclude,
      end_col: exclude,
    }),
  ])
  .transform(camelize);

export type PosRange = z.infer<typeof PosRangeSchema>;
