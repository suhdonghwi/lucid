import { generateTrace, terminateWorker } from "@/backend/js";

import { Repository } from "@/data/repository";

import { TraceTree } from "@/components/TraceTree";

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

          path="/index.js"
          locRange={{
            start: 0,
            end: 0,
          }}

          onChange={onChange}
        />
      </div>
    </div>
  );
}
