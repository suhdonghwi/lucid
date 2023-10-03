import { useState } from "react";

import { runPython, writeMessage, interrupt } from "@/pyodide-helper";

import { CodeSpace } from "@/components/CodeSpace";

import * as cls from "./index.css";

import type { EvalEvent } from "@/schemas/EvalEvent";
import type { FrameEvent } from "@/schemas/FrameEvent";
import type { CallGraph } from "./CallGraph";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);
  const [callGraph, setCallGraph] = useState<CallGraph>([{ evalStack: [] }]);

  async function runCode() {
    const result = await runPython(mainCode, {
      onStmtEnter: (evalEvent: EvalEvent) => {
        setCallGraph((callGraph) => {
          const newCallGraph = callGraph.slice();
          newCallGraph[newCallGraph.length - 1].evalStack.push(
            evalEvent.posRange
          );
          return newCallGraph;
        });

        console.log("stmt enter");
      },
      onStmtExit: (evalEvent: EvalEvent) => {
        setCallGraph((callGraph) => {
          const newCallGraph = callGraph.slice();
          newCallGraph[newCallGraph.length - 1].evalStack.pop();
          return newCallGraph;
        });

        console.log("stmt exit");
      },
      onFrameEnter: (frameEvent: FrameEvent) => {
        setCallGraph((callGraph) => {
          const newCallGraph = callGraph.slice();
          newCallGraph.push({ event: frameEvent, evalStack: [] });
          return newCallGraph;
        });

        console.log("frame enter");
      },
      onFrameExit: (frameEvent: FrameEvent) => {
        setCallGraph((callGraph) => {
          const newCallGraph = callGraph.slice();
          newCallGraph.pop();
          return newCallGraph;
        });

        console.log("frame exit");
      },
    });

    console.log("runPython result: ", result);

    // setCallGraph([]);
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
        <input type="button" value="Next" onClick={writeMessage} />
        <input type="button" value="Interrupt" onClick={interrupt} />
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
