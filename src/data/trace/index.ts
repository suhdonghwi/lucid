import { LocRange } from "@/data/locRange";

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
