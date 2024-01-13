import estree from "estree";

type ModuleLog = {
  type: "module";

  innerLog: (ModuleLog | FunctionLog)[];
};

type FunctionLog = {
  type: "function";

  caller: estree.Node;
  callee: estree.Node;

  innerLog: (ModuleLog | FunctionLog)[];
};

export type ExecutionLog = ModuleLog;
