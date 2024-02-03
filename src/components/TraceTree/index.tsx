import { Repository } from "@/repository";

import { CodeWindow } from "@/components/CodeWindow";
import { LocRange } from "@/trace/LocRange";

type TraceTreeProps = {
  repository: Repository;
  locRange: LocRange;

  onChange: (path: string, content: string) => void;

};

export function TraceTree({
  repository,
  locRange,
  onChange,
}: TraceTreeProps) {
  return (
    <CodeWindow
      code={repository.getContent(locRange.file.path) ?? ""}
      onCodeChange={(value) => onChange(locRange.file.path, value)}
    />
  );
}
