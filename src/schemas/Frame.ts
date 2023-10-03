import { z } from "zod";

import { posRangeSchema } from "./PosRange";

export const frameSchema = z.object({
  id: z.number().int(),
  codeObjectId: z.number().int(),
  posRange: posRangeSchema,
  callerPosRange: posRangeSchema,
});

export type Frame = z.infer<typeof frameSchema>;
