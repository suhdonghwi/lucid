import { LocationRange } from "@/data/locRange";

export type ModuleTrace = {
  type: "module";

  innerTrace: ExecutionTrace[];
};

export type FunctionCallTrace = {
  type: "function_call";

  caller: LocationRange;
  callee: LocationRange;

  innerTrace: ExecutionTrace[];
};

export type ExecutionTrace = ModuleTrace | FunctionCallTrace;

export { TraceManager } from "./TraceManager";
