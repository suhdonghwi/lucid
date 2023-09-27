export type CodeRange =
  | {
      lineNo: number;
      endLineNo: number;
      col: number;
      endCol: number;
    }
  | {
      lineNo: number;
      endLineNo?: never;
      col: number;
      endCol?: never;
    }
  | {
      lineNo: number;
      endLineNo?: never;
      col?: never;
      endCol?: never;
    };
