import { useState } from "react";

import { runPython } from "../pyodide-helper";

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

  async function runCode() {
    const result = await runPython(code);
    console.log(result);
    // const result = await asyncRun(code, {});
    // console.log(result);
    //
    // switch (result.type) {
    //   case "success":
    //     setEditorMode({
    //       type: "eval",
    //       trackData: result.data,
    //       currentStep: 0,
    //     });
    //     break;
    //   case "error":
    //     setEditorMode({
    //       type: "error",
    //       error: result.error,
    //     });
    // }
  }

  function adjustStep(by: number) {
    if (editorMode.type === "eval") {
      setEditorMode({
        ...editorMode,
        currentStep: editorMode.currentStep + by,
      });
    } else {
      console.log("not in eval mode!");
    }
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
        onClick={() => adjustStep(1)}
      />
      <input
        type="button"
        className={cls.runButton}
        value="Prev"
        onClick={() => adjustStep(-1)}
      />
    </div>
  );
}

export default CodeRunner;
