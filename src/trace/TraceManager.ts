import { ExecutionTrace } from ".";

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
