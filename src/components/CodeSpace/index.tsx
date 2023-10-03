import { CodeWindow, CodeWindowMode } from "@/components/CodeWindow";
import * as cls from "./index.css";

import type { Frame } from "@/schemas/Frame";

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;

  callstack: Frame[];
  windowMode: CodeWindowMode;
};

export function CodeSpace({
  mainCode,
  onMainCodeChange,
  callstack,
  windowMode,
}: CodeSpaceProps) {
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
