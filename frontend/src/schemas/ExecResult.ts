import { ExecError } from "./ExecError";

export type ExecResult =
  | {
      type: "success";
    }
  | {
      type: "error";
      error: ExecError;
    };
