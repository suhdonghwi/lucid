import { Path } from "@/data/repository";
import { LocationRange } from "@/data/locRange";

import { ExecutionTrace } from ".";

export class TraceManager {
  private readonly traceStack: ExecutionTrace[];

  constructor(entryPoint: Path) {
    this.traceStack = [
      {
        path: entryPoint,
        locationRange: {
          start: 0,
          end: 0,
        },
        innerTraces: [],
      },
    ];
  }

  getCurrentTrace() {
    return this.traceStack[this.traceStack.length - 1];
  }

  newDepth({
    source,
    trace,
  }: { source: LocationRange; trace: ExecutionTrace }) {
    this.getCurrentTrace().innerTraces.push({ source, trace });
    this.traceStack.push(trace);
  }

  finishDepth() {
    this.traceStack.pop();
  }
}
