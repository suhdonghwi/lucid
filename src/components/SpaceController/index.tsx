import { useState } from "react";

import * as python from "@/python";
import type { CallGraph } from "@/CallGraph";

import { CodeSpace } from "@/components/CodeSpace";
import * as cls from "./index.css";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);

  const [callGraph, setCallGraph] = useState<CallGraph>([{ evalStack: [] }]);

  async function runCode() {
    const result = await python.execute(mainCode, (newCallGraph: CallGraph) => {
      // NOTE:
      // When `newCallGraph` is passed from web-worker to main thread,
      // the object is deep copied; therefore its reference is changed every time.
      // Therefore it is fine to use `useState`, however we need to find better design.
      setCallGraph(newCallGraph);
    });

    console.log("runPython result: ", result);
    setCallGraph([{ evalStack: [] }]);
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
          callGraph={callGraph}
        />
      </div>
    </div>
  );
}
