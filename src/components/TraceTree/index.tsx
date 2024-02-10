import { Path, Repository } from "@/data/repository";
import { LocationRange } from "@/data/locRange";
import { ExecutionTrace } from "@/data/trace";

import { CodeWindow } from "@/components/CodeWindow";

import * as styles from "./index.css";
import { useMemo } from "react";

type TraceTreeProps = {
  repository: Repository;

  trace?: ExecutionTrace;
  path: Path;
  locRange: LocationRange;

  onChange: (path: string, content: string) => void;
};

export function TraceTree({
  repository,

  trace,
  path,
  locRange,

  onChange,
}: TraceTreeProps) {
  const messages = useMemo(() => {
    if (trace === undefined) return [];
    return getMessages(trace);
  }, [trace]);

  return (
    <div className={styles.rootContainer}>
      <CodeWindow
        code={repository.getContent(path) ?? ""}
        onCodeChange={(value) => onChange(path, value)}
      />

      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

function getMessages(trace: ExecutionTrace): string[] {
  return trace.children.flatMap((child) =>
    child.type === "log" ? [child.message as string] : getMessages(child.trace),
  );
}
