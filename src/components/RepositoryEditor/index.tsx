import { useState } from "react";

import { generateTrace, terminateWorker } from "@/backend/js";

import { Repository } from "@/data/repository";
import { ExecutionTrace } from "@/data/trace";

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
  const [currentTrace, setCurrentTrace] = useState<ExecutionTrace | null>(null);

  async function handleRun() {
    const result = await generateTrace(repository);
    console.log(result);

    setCurrentTrace(result);
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

          trace={currentTrace ?? undefined}
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
