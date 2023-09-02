import { CodeRange } from "./CodeRange";

export type RunError = {
  message: string;
  range: CodeRange;
};
