import { LocRange } from "./LocRange";

export type ModuleTrace = {
	type: "module";

	innerTrace: ExecutionTrace[];
};

export type FunctionCallTrace = {
	type: "function_call";

	caller: LocRange;
	callee: LocRange;

	innerTrace: ExecutionTrace[];
};

export type ExecutionTrace = ModuleTrace | FunctionCallTrace;

export { TraceManager } from "./TraceManager";
