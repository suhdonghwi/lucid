import estree from "estree";

type ModuleLog = {
  type: "module";

  innerLog: ExecutionLog[];
};

type FunctionLog = {
  type: "function";

  caller: estree.Node;
  callee: estree.Node;

  innerLog: ExecutionLog[];
};

export type ExecutionLog = ModuleLog | FunctionLog;

export class ExecutionLogManager {
  private readonly logStack: ExecutionLog[] = [
    {
      type: "module",
      innerLog: [],
    },
  ];

  private getCurrentLog() {
    return this.logStack[this.logStack.length - 1];
  }

  startLog(log: ExecutionLog) {
    this.logStack.push(log);
  }

  finishLog() {
    const log = this.logStack.pop();
    if (log === undefined) {
      throw new Error("No log to finish");
    }

    this.getCurrentLog().innerLog.push(log);
  }

  getLog() {
    return this.getCurrentLog();
  }
}
