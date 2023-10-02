import { useState } from "react";

import type { PosRange } from "@/schemas/PosRange";
import { runPython, writeMessage, interrupt } from "@/pyodide-helper";

import CodeEditor, { CodeEditorMode } from "./CodeEditor";
import * as cls from "./CodeRunner.css";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);
  const [editorMode, setEditorMode] = useState<CodeEditorMode>({
    type: "normal",
  });

  function onBreak(range: PosRange) {
    setEditorMode({ type: "eval", range });
  }

  async function runCode() {
    const result = await runPython(code, onBreak);

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
      <CodeEditor code={code} onCodeUpdate={setCode} mode={editorMode} />
      <input
        type="button"
        className={cls.runButton}
        value="Run"
        onClick={runCode}
      />
      <input
        type="button"
        className={cls.runButton}
        value="Next"
        onClick={onClickNext}
      />
      <input
        type="button"
        className={cls.runButton}
        value="Interrupt"
        onClick={onInterrupt}
      />
    </div>
  );
}

export default CodeRunner;
