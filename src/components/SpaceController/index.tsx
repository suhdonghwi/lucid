import { useState } from "react";

import { runPython, writeMessage, interrupt } from "@/pyodide-helper";

import { CodeSpace } from "@/components/CodeSpace";

import * as cls from "./index.css";
import { Frame } from "@/schemas/Frame";
import { CodeWindowMode } from "../CodeWindow";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function SpaceController() {
  const [mainCode, setMainCode] = useState(exampleCode);

  const [callstack, setCallstack] = useState<Frame[]>([]);
  const [windowMode, setWindowMode] = useState<CodeWindowMode>({
    type: "normal",
  });

  async function runCode() {
    const result = await runPython(mainCode, {
      onStmtExit: ({ stmtPosRange }) => {
        setWindowMode({ type: "eval", range: stmtPosRange });
        console.log("stmt exit");
      },
      onFrameEnter: (frame) => {
        setCallstack((callstack) => [...callstack, frame]);
        console.log("frame enter");
      },
      onFrameExit: () => {
        setCallstack(callstack.slice(0, -1));
        console.log("frame exit");
      },
    });

    console.log("runPython result: ", result);

    if (result.type === "error") {
      setWindowMode({ type: "error", error: result.error });
    } else {
      setWindowMode({ type: "normal" });
      setCallstack([]);
    }
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
          windowMode={windowMode}
        />
      </div>
    </div>
  );
}
