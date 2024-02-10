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

  addChildLog({
    source,
    message,
  }: { source: LocationRange; message: unknown }) {
    const currentTrace = this.getCurrentTrace();

    currentTrace.children.push({
      type: "log",
      source,
      message,
    });
    currentTrace.flattenedLogs.push(message);
  }

  startChildTrace({
    source,
    trace,
  }: { source: LocationRange; trace: ExecutionTrace }) {
    this.getCurrentTrace().children.push({
      type: "trace",
      source,
      trace,
    });
    this.traceStack.push(trace);
  }

  finishCurrentTrace() {
    const poppedTrace = this.traceStack.pop();

    if (poppedTrace === undefined) {
      throw new Error("Tried to finish a trace when there was none");
    }

    this.getCurrentTrace().flattenedLogs.push(...poppedTrace.flattenedLogs);
  }
}
