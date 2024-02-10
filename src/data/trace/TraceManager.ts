import { LocationRange } from "@/data/locRange";

import { ExecutionTrace } from ".";

export class TraceManager {
  private readonly traceStack: ExecutionTrace[];

  constructor(initialTrace: ExecutionTrace) {
    this.traceStack = [initialTrace];
  }

  getCurrentTrace() {
    return this.traceStack[this.traceStack.length - 1];
  }

  startChildTrace({
    source,
    trace,
  }: { source: LocationRange; trace: ExecutionTrace }) {
    this.getCurrentTrace().children.push({ type: "trace", source, trace });
    this.traceStack.push(trace);
  }

  addChildLog({ source, message}: { source: LocationRange; message: unknown }) {
    this.getCurrentTrace().children.push({ type: "log", source, message });
  }

  finishCurrentTrace() {
    this.traceStack.pop();
  }
}
