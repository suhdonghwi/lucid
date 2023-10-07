import { useRef, useState } from "react";

import * as python from "@/python";

import { CodeSpace } from "@/components/CodeSpace";
import * as cls from "./index.css";

import type { EvalEvent } from "@/schemas/EvalEvent";
import type { FrameEvent } from "@/schemas/FrameEvent";
import { CallGraph, CallNode } from "./CallGraph";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);

  const callGraphRef = useRef<CallGraph>(new CallGraph());
  const forceUpdate = useForceUpdate();

  async function runCode() {
    const result = await python.run(mainCode, {
      onStmtEnter: (evalEvent: EvalEvent) => {
        callGraphRef.current.top().push(evalEvent.posRange);
        forceUpdate();

        console.log("stmt enter");
      },
      onStmtExit: (evalEvent: EvalEvent) => {
        callGraphRef.current.top().pop();
        console.log("stmt exit");
      },
      onFrameEnter: (frameEvent: FrameEvent) => {
        callGraphRef.current.push(new CallNode(frameEvent));
        console.log("frame enter");
      },
      onFrameExit: (frameEvent: FrameEvent) => {
        callGraphRef.current.pop();
        forceUpdate();

        console.log("frame exit");
      },
    });

    console.log("runPython result: ", result);

    callGraphRef.current = new CallGraph();
    forceUpdate();
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
        <input type="button" value="Next" onClick={python.resume} />
        <input type="button" value="Interrupt" onClick={python.interrupt} />
      </div>

      <div className={cls.spaceContainer}>
        <CodeSpace
          mainCode={mainCode}
          onMainCodeChange={setMainCode}
          callGraph={callGraphRef.current}
        />
      </div>
    </div>
  );
}
