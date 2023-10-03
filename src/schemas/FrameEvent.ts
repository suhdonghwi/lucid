import { z } from "zod";

import { posRangeSchema } from "./PosRange";

export const frameEventSchema = z.object({
  id: z.number().int(),
  codeObjectId: z.number().int(),
  posRange: posRangeSchema,
});

export type FrameEvent = z.infer<typeof frameEventSchema>;
