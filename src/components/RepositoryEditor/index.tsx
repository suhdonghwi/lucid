import { generateTrace, terminateWorker } from "@/backend/js";

import { Repository } from "@/repository";

import * as styles from "./index.css";
import { TraceTree } from "../TraceTree";

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
    <div className={styles.rootContainer}>
      <div className={styles.buttonContainer}>
        <button type="button" onClick={handleRun}>
          Run
        </button>
        <button type="button" onClick={handleTerminate}>
          Terminate
        </button>
      </div>

      <div className={styles.windowContainer}>
        <TraceTree
          repository={repository}
          locRange={{
            file: {
              path: "index.js",
              content: repository.getContent("index.js") ?? "",
            },
            start: 0,
            end: 0,
          }}
          onChange={(value) => onChange("index.js", value)}
        />
      </div>
    </div>
  );
}
