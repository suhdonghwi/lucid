export type EventCallbacks = {
	onFunctionEnter: (sourceIndex: number, nodeIndex: number) => void;
	onFunctionLeave: (sourceIndex: number, nodeIndex: number) => void;

	onExpressionEnter: (sourceIndex: number, nodeIndex: number) => void;
	onExpressionLeave: <T>(
		sourceIndex: number,
		nodeIndex: number,
		expression: T,
	) => T;
};
