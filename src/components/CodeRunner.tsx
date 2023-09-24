import { CodeRange } from "@/CodeRange";
import { useState } from "react";

import { runPython, writeMessage } from "../pyodide-helper";

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

  function onBreak(range: CodeRange) {
    // console.log(range);
    setEditorMode({ type: "eval", range });
  }

  async function runCode() {
    const result = await runPython(code, onBreak);

    if (result.type === "error") {
      setEditorMode({
        type: "error",
        error: { range: result.range, message: result.message },
      });
    }
    console.log(result);
  }

  async function onClickNext() {
    await writeMessage();
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
    </div>
  );
}

export default CodeRunner;
