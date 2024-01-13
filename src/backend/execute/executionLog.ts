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
  private logStack: ExecutionLog[] = [
    {
      type: "module",
      innerLog: [],
    },
  ];

  private currentLog() {
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

    this.currentLog().innerLog.push(log);
  }

  getLog() {
    return this.currentLog();
  }
}
