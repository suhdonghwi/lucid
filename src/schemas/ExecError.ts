import { z } from "zod";
import { PosRangeSchema } from "./PosRange";

export const ExecErrorSchema = z.object({
  range: PosRangeSchema,
  message: z.string(),
});

export type ExecError = z.infer<typeof ExecErrorSchema>;
