import { useState } from "react";

import { runPython, writeMessage, interrupt } from "@/pyodide-helper";

import { CodeSpace, Callstack } from "@/components/CodeSpace";

import * as cls from "./index.css";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);
  const [callstack, setCallstack] = useState<Callstack>([]);

  async function runCode() {
    const result = await runPython(mainCode, {
      onStmtExit: ({ stmtPosRange }) => {
        return;
      },
      onFrameEnter: ({ codeObjectId, framePosRange, callerPosRange }) => {
        setCallstack((callstack) => [
          ...callstack,
          { codeObjectId, framePosRange, callerPosRange },
        ]);
        return;
      },
    });
    console.log("runPython result: ", result);
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
          callstack={callstack}
        />
      </div>
    </div>
  );
}
