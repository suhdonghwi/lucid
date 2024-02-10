import { Path, Repository } from "@/data/repository";
import { LocationRange } from "@/data/locRange";

import { CodeWindow } from "@/components/CodeWindow";

import * as styles from "./index.css";

type TraceTreeProps = {
  repository: Repository;

  path: Path;
  locRange: LocationRange;

  onChange: (path: string, content: string) => void;
};

export function TraceTree({
  repository,

  path,
  locRange,

  onChange,
}: TraceTreeProps) {
  return (
    <div className={styles.rootContainer}>
      <CodeWindow
        code={repository.getContent(path) ?? ""}
        onCodeChange={(value) => onChange(path, value)}
      />
    </div>
  );
}
