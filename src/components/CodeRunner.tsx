import React, { useState } from "react";
import { asyncRun } from "../pyodideHelper";

import CodeEditor from "./CodeEditor";
import * as cls from "./CodeRunner.css";

const exampleCode = `def f():
    print("Hello, world!")

f()`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);

  async function runCode() {
    const result = await asyncRun(code, {});
    console.log(result);
  }

  return (
    <div className={cls.rootContainer}>
      <CodeEditor code={code} onCodeUpdate={(code) => setCode(code)} />
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
