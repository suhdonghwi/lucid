import { useState } from "react";

import { CodeWindow } from "@/components/CodeWindow";
import * as cls from "./index.css";

import { executeCode, terminateWorker } from "@/backend";

const exampleCode = `console.log("hi");`;

export function ExecutionController() {
  const [code, setCode] = useState(exampleCode);

  function runCode() {
    executeCode(code);
  }

  function terminate() {
    terminateWorker();
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
        <input type="button" value="Terminate" onClick={terminate} />
      </div>

      <div className={cls.windowContainer}>
        <CodeWindow code={code} onCodeChange={setCode} />
      </div>
    </div>
  );
}
