import { Repository } from "@/data/repository";
import { LocationRange } from "@/data/locRange";

import { CodeWindow } from "@/components/CodeWindow";

type TraceTreeProps = {
  repository: Repository;
  locRange: LocationRange;

  onChange: (path: string, content: string) => void;
};

export function TraceTree({
  repository,
  locRange,
  onChange,
}: TraceTreeProps) {
  return (
    <CodeWindow
      code={repository.getContent(locRange.path) ?? ""}
      onCodeChange={(value) => onChange(locRange.path, value)}
    />
  );
}
