import { generateTrace, terminateWorker } from "@/backend/js";

import { CodeWindow } from "@/components/CodeWindow";
import { Repository } from "@/repository";

import * as styles from "./index.css";

type RepositoryEditorProps = {
  repository: Repository;
  onChange: (path: string, content: string) => void;
};

export function RepositoryEditor(props: RepositoryEditorProps) {
  async function handleRun() {
    const result = await generateTrace(props.repository);
    console.log(result);
  }

  function handleTerminate() {
    terminateWorker();
  }

  const code = props.repository.getContent("index.js") ?? "";

  return (
    <div className={styles.rootContainer}>
      <div className={styles.buttonContainer}>
        <button onClick={handleRun}>Run</button>
        <button onClick={handleTerminate}>Terminate</button>
      </div>

      <div className={styles.windowContainer}>
        <CodeWindow
          code={code}
          onCodeChange={(value) => props.onChange("index.js", value)}
        />
      </div>
    </div>
  );
}
