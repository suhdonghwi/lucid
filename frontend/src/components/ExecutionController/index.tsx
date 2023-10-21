import { useState } from "react";

import * as python from "@/python";

import { CodeWindow } from "@/components/CodeWindow";
import * as cls from "./index.css";

const exampleCode = `def add1(x):
  x = x + 1
  return x

add1(10)`;

export function ExecutionController() {
  const [code, setCode] = useState(exampleCode);

  async function runCode() {
    const result = await python.execute(code);

    console.log("runPython result: ", result);
  }

  return (
    <div className={cls.rootContainer}>
      <div className={cls.buttonContainer}>
        <input type="button" value="Run" onClick={runCode} />
        <input type="button" value="Next" onClick={python.resume} />
        <input type="button" value="Interrupt" onClick={python.interrupt} />
      </div>

      <div className={cls.spaceContainer}>
        <CodeWindow code={code} onCodeChange={setCode} />
      </div>
    </div>
  );
}
