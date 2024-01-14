import estree from "estree";

type ModuleTrace = {
  type: "module";

  innerTrace: ExecutionTrace[];
};

type FunctionCallTrace = {
  type: "function_call";

  caller: estree.Node;
  callee: estree.Node;

  innerTrace: ExecutionTrace[];
};

export type ExecutionTrace = ModuleTrace | FunctionCallTrace;

export { TraceManager } from "./TraceManager";
