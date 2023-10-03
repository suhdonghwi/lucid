import { FrameEvent } from "@/schemas/FrameEvent";
import { PosRange } from "@/schemas/PosRange";

export class CallNode {
  private _event?: FrameEvent;
  private _evalStack: PosRange[] = [];

  constructor(event?: FrameEvent) {
    this._event = event;
  }

  push(range: PosRange) {
    this._evalStack.push(range);
  }

  pop(): PosRange | undefined {
    return this._evalStack.pop();
  }

  top(): PosRange | undefined {
    return this._evalStack[this._evalStack.length - 1];
  }

  get event(): FrameEvent | undefined {
    return this._event;
  }
}

export class CallGraph {
  private _nodes: CallNode[] = [new CallNode()];

  push(node: CallNode) {
    this._nodes.push(node);
  }

  pop(): CallNode | undefined {
    if (this._nodes.length <= 1) {
      return undefined;
    }

    return this._nodes.pop();
  }

  top(): CallNode {
    return this._nodes[this._nodes.length - 1];
  }

  get nodes(): CallNode[] {
    return this._nodes;
  }
}
