import { LocRange } from "./LocRange";

type ModuleTrace = {
  type: "module";

  innerTrace: ExecutionTrace[];
};

type FunctionCallTrace = {
  type: "function_call";

  caller: LocRange;
  callee: LocRange;

  innerTrace: ExecutionTrace[];
};

export type ExecutionTrace = ModuleTrace | FunctionCallTrace;

export { TraceManager } from "./TraceManager";
