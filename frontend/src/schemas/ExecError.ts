import { z } from "zod";

import { posRangeSchema } from "./PosRange";

export const execErrorSchema = z.object({
  range: posRangeSchema,
  message: z.string(),
});

export type ExecError = z.infer<typeof execErrorSchema>;
