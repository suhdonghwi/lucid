export type EventCallbacks = {
  onFunctionEnter: (sourceFileIndex: number, nodeIndex: number) => void;
  onFunctionLeave: (sourceFileIndex: number, nodeIndex: number) => void;

  onExpressionEnter: (sourceFileIndex: number, nodeIndex: number) => void;
  onExpressionLeave: (
    sourceFileIndex: number,
    nodeIndex: number,
    expression: unknown,
  ) => void;
};
