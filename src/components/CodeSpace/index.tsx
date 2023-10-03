import { CodeWindow, CodeWindowMode } from "@/components/CodeWindow";
import * as cls from "./index.css";

import type { Frame } from "@/schemas/Frame";
import { PosRange } from "@/schemas/PosRange";

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;

  callstack: Frame[];
  highlightPosRange?: PosRange;
};

export function CodeSpace({
  mainCode,
  onMainCodeChange,
  callstack,
  highlightPosRange,
}: CodeSpaceProps) {
  const windowMode: CodeWindowMode =
    highlightPosRange === undefined
      ? { type: "normal" }
      : { type: "eval", range: highlightPosRange };

  return (
    <div className={cls.rootContainer}>
      <div className={cls.windowsContainer}>
        <CodeWindow
          code={mainCode}
          onCodeChange={onMainCodeChange}
          mode={windowMode}
        />
        {callstack.map(({ posRange }, index) => (
          <CodeWindow
            key={index}
            code={mainCode}
            posRange={posRange}
            mode={windowMode}
          />
        ))}
      </div>
    </div>
  );
}
