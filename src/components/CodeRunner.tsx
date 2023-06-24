import { useState } from "react";

import { asyncRun } from "../PyodideHelper";

import CodeEditor from "./CodeEditor";
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
  const [error, setError] = useState<RunError | null>(null);
  const [highlight, setHighlight] = useState<EvalRange | null>(null);

  async function runCode() {
    const result = await asyncRun(code, {});
    console.log(result);

    if (result.type === "error") {
      setError(result.error);
    } else {
      setError(null);
      setHighlight(result.data[0].evalRange);
    }
  }

  function onCodeUpdate(code: string) {
    setCode(code);
  }

  return (
    <div className={cls.rootContainer}>
      <CodeEditor
        code={code}
        onCodeUpdate={onCodeUpdate}
        evalRange={highlight}
        error={error}
      />
      <input
        type="button"
        className={cls.runButton}
        value="Run"
        onClick={runCode}
      />
    </div>
  );
}

export default CodeRunner;
