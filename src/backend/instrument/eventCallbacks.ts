export type EventCallbacks = {
  onFunctionEnter: (sourceFileIndex: number, nodeIndex: number) => void;
  onFunctionLeave: (sourceFileIndex: number, nodeIndex: number) => void;

  onExpressionEnter: (sourceFileIndex: number, nodeIndex: number) => void;
  onExpressionLeave: <T>(
    sourceFileIndex: number,
    nodeIndex: number,
    expression: T,
  ) => T;
};
