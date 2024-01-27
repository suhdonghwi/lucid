import { generateTrace, terminateWorker } from "@/backend/js";

import { CodeWindow } from "@/components/CodeWindow";
import { Repository } from "@/repository";

import * as styles from "./index.css";

type RepositoryEditorProps = {
  repository: Repository;
  onChange: (path: string, content: string) => void;
};

export function RepositoryEditor({
  repository,
  onChange,
}: RepositoryEditorProps) {
  async function handleRun() {
    const result = await generateTrace(repository);
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
          initialValue={repository.getContent("index.js") ?? ""}
          onValueChange={(value) => onChange("index.js", value)}
        />
      </div>
    </div>
  );
}
