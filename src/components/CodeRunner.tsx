import { useMemo, useState } from "react";

import { asyncRun, PyodideResult } from "../PyodideHelper";

import CodeEditor, { CodeEditorMode } from "./CodeEditor";
import * as cls from "./CodeRunner.css";

import RunError from "../RunError";
import { EvalRange } from "../TrackData";

const exampleCode = `def f():
    print("apple")
    print("banana")
    print("coconut")

f()`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);

  const [lastRunResult, setLastRunResult] = useState<PyodideResult | null>(
    null
  );
  const [evalStep, setEvalStep] = useState<number>(0);

  const editorMode = useMemo<CodeEditorMode>(() => {
    if (lastRunResult === null) return { type: "normal" };

    switch (lastRunResult.type) {
      case "success":
        return {
          type: "eval",
          trackData: lastRunResult.data,
          currentStep: evalStep,
        };
      case "error":
        return {
          type: "error",
          error: lastRunResult.error,
        };
    }
  }, [evalStep, lastRunResult]);

  async function runCode() {
    const result = await asyncRun(code, {});
    console.log(result);

    setLastRunResult(result);
    setEvalStep(0);
  }

  function onCodeUpdate(code: string) {
    setCode(code);
  }

  return (
    <div className={cls.rootContainer}>
      <CodeEditor code={code} onCodeUpdate={onCodeUpdate} mode={editorMode} />
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
        onClick={() => setEvalStep((v) => v + 1)}
      />
      <input
        type="button"
        className={cls.runButton}
        value="Prev"
        onClick={() => setEvalStep((v) => v - 1)}
      />
    </div>
  );
}

export default CodeRunner;
