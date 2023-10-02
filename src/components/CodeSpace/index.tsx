import { useState } from "react";

import { CodeWindow, CodeWindowMode } from "@/components/CodeWindow";
import * as cls from "./index.css";
import { cropPosRange, PosRange } from "@/schemas/PosRange";

// TODO: make this a schema
export type Callstack = Array<{
  codeObjectId: number;
  framePosRange: PosRange;
  callerPosRange: PosRange;
}>;

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;
  callstack: Callstack;
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
        {callstack.map(({ framePosRange }, index) => (
          <CodeWindow
            key={index}
            code={cropPosRange(mainCode, framePosRange)}
            mode={{ type: "normal" }}
          />
        ))}
      </div>
    </div>
  );
}
