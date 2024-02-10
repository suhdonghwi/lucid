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

  addChildLog({ source, content }: { source: LocationRange; content: string }) {
    this.getCurrentTrace().children.push({ type: "log", source, content });
  }

  finishCurrentTrace() {
    this.traceStack.pop();
  }
}
