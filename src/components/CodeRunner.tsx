import React, { useState } from "react";
import pyodide from "../Pyodide";

import CodeEditor from "./CodeEditor";
import * as cls from "./CodeRunner.css";

const exampleCode = `def f():
    print("Hello, world!")

f()`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);

  async function runCode() {
    console.log(code);

    const result = await pyodide.runPythonAsync(code);
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
