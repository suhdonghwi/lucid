import { useState } from "react";

import { asyncRun } from "../PyodideHelper";

import CodeEditor from "./CodeEditor";
import * as cls from "./CodeRunner.css";

import { RunError } from "../RunError";
import { PosRange } from "../TrackData";

const exampleCode = `def f():
    print("apple")
    print("banana")
    print("coconut")

f()`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);
  const [error, setError] = useState<RunError | null>(null);
  const [highlight, setHighlight] = useState<PosRange | null>(null);

  async function runCode() {
    const result = await asyncRun(code, {});
    console.log(result);

    if (result.type === "error") {
      setError(result.error);
    } else {
      setHighlight(result.data[0].posRange);
    }
  }

  function onCodeUpdate(code: string) {
    setCode(code);
    setError(null);
  }

  return (
    <div className={cls.rootContainer}>
      <CodeEditor
        code={code}
        onCodeUpdate={onCodeUpdate}
        highlight={highlight}
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
