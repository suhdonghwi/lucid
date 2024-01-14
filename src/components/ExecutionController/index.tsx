import { createSignal } from "solid-js";

import { generateTrace, terminateWorker } from "@/backend/js";

import { CodeWindow } from "@/components/CodeWindow";
import * as styles from "./index.css";

const INITIAL_CODE = `function foo() {
  console.log("hi");
}

foo();`;

export function ExecutionController() {
  const [code, setCode] = createSignal(INITIAL_CODE);

  async function handleRun() {
    const result = await generateTrace(code());
    console.log(result);
  }

  function handleTerminate() {
    terminateWorker();
  }

  return (
    <div class={styles.rootContainer}>
      <div class={styles.buttonContainer}>
        <button onClick={handleRun}>Run</button>
        <button onClick={handleTerminate}>Terminate</button>
      </div>

      <div class={styles.windowContainer}>
        <CodeWindow
          initialValue={code()}
          onValueChange={(value) => setCode(value)}
        />
      </div>
    </div>
  );
}
