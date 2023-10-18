import { z } from "zod";

import { posRangeSchema } from "./PosRange";

export const evalEventSchema = z.object({
  posRange: posRangeSchema,
  frameId: z.number().int(),
});

export type EvalEvent = z.infer<typeof evalEventSchema>;
