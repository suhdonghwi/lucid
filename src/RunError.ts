export type ErrorRange = {
  line: number;
  endLine: number;

  col: number | null;
  endCol: number | null;
}

type RunError = {
  message: string;

  range: ErrorRange;
};

export default RunError;
