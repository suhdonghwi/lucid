import { Path, Repository } from "@/data/repository";
import { LocationRange } from "@/data/locRange";

import { CodeWindow } from "@/components/CodeWindow";

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
    <CodeWindow
      code={repository.getContent(path) ?? ""}
      onCodeChange={(value) => onChange(path, value)}
    />
  );
}
