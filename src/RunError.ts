export type RunError = {
  message: string;

  line: number;
  endLine: number;

  offset: number | null;
  endOffset: number | null;
};
