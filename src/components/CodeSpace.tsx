import { useState } from "react";

import type { PosRange } from "@/schemas/PosRange";
import { runPython, writeMessage, interrupt } from "@/pyodide-helper";

import { CodeWindow, CodeWindowMode } from "./CodeWindow";
import * as cls from "./CodeSpace.css";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function CodeSpace() {
  const [code, setCode] = useState(exampleCode);
  const [editorMode, setEditorMode] = useState<CodeWindowMode>({
    type: "normal",
  });

  function onBreak(range: PosRange) {
    setEditorMode({ type: "eval", range });
  }

  async function runCode() {
    const result = await runPython(code, onBreak);
    console.log("runPython result: ", result);

    if (result.type === "error") {
      setEditorMode({
        type: "error",
        error: result.error,
      });
    } else {
      setEditorMode({
        type: "normal",
      });
    }
  }

  async function onClickNext() {
    await writeMessage();
  }

  async function onInterrupt() {
    await interrupt();
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
        <input type="button" value="Next" onClick={onClickNext} />
        <input type="button" value="Interrupt" onClick={onInterrupt} />
      </div>

      <div className={cls.windowsContainer}>
        <CodeWindow code={code} onCodeUpdate={setCode} mode={editorMode} />
        <CodeWindow code={code} onCodeUpdate={setCode} mode={editorMode} />
      </div>
    </div>
  );
}
