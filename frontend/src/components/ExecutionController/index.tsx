import { useState } from "react";

import { CodeWindow } from "@/components/CodeWindow";
import * as cls from "./index.css";

import { backendWorker } from "@/backend";

const exampleCode = `console.log("hi");`;

export function ExecutionController() {
  const [code, setCode] = useState(exampleCode);

  async function runCode() {
    backendWorker.executeCode(code);
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
      </div>

      <div className={cls.windowContainer}>
        <CodeWindow code={code} onCodeChange={setCode} />
      </div>
    </div>
  );
}
