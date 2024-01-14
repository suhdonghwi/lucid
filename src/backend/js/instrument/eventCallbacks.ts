export type EventCallbacks = {
  onFunctionEnter: (nodeIndex: number) => void;
  onFunctionLeave: (nodeIndex: number) => void;

  onExpressionEnter: (nodeIndex: number) => void;
  onExpressionLeave: <T>(nodeIndex: number, expression: T) => T;
};
