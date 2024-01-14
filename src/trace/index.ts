import estree from "estree";

type ModuleTrace = {
  type: "module";

  innerTrace: ExecutionTrace[];
};

type FunctionTrace = {
  type: "function";

  caller: estree.Node;
  callee: estree.Node;

  innerTrace: ExecutionTrace[];
};

export type ExecutionTrace = ModuleTrace | FunctionTrace;

export class TraceManager {
  private readonly traceStack: ExecutionTrace[] = [
    {
      type: "module",
      innerTrace: [],
    },
  ];

  getCurrentTrace() {
    return this.traceStack[this.traceStack.length - 1];
  }

  newDepth(trace: ExecutionTrace) {
    this.traceStack.push(trace);
  }

  finishDepth() {
    const trace = this.traceStack.pop();
    if (trace === undefined) {
      throw new Error("No trace depth to finish");
    }

    this.getCurrentTrace().innerTrace.push(trace);
  }
}
