import { useState } from "react";

import { CodeWindow, CodeWindowMode } from "@/components/CodeWindow";
import * as cls from "./index.css";

import type { Frame } from "@/schemas/Frame";

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;
  callstack: Frame[];
};

export function CodeSpace({
  mainCode,
  onMainCodeChange,
  callstack,
}: CodeSpaceProps) {
  const [editorMode, setEditorMode] = useState<CodeWindowMode>({
    type: "normal",
  });

  return (
    <div className={cls.rootContainer}>
      <div className={cls.windowsContainer}>
        <CodeWindow
          code={mainCode}
          onCodeChange={onMainCodeChange}
          mode={editorMode}
        />
        {callstack.map(({ posRange }, index) => (
          <CodeWindow
            key={index}
            code={mainCode}
            posRange={posRange}
            mode={{ type: "normal" }}
          />
        ))}
      </div>
    </div>
  );
}
