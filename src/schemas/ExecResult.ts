import { z } from "zod";

export const ExecError = z.object({
  lineno: z.number(),
  end_lineno: z.number(),
  col: z.number(),
  end_col: z.number(),

  message: z.string(),
});

export type ExecError = z.infer<typeof ExecError>;
