import { useRef, useState } from "react";

import * as python from "@/python";

import { CodeSpace } from "@/components/CodeSpace";
import * as cls from "./index.css";

import type { CallGraph } from "@/CallGraph";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

function useForceUpdate() {
  const [_, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);

  const callGraphRef = useRef<CallGraph>([{ evalStack: [] }]);
  const forceUpdate = useForceUpdate();

  async function runCode() {
    const result = await python.execute(mainCode, (callGraph: CallGraph) => {
      callGraphRef.current = callGraph;
      forceUpdate();
    });

    console.log("runPython result: ", result);

    callGraphRef.current = [{ evalStack: [] }];
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
