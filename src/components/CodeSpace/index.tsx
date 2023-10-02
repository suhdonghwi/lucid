import { useState } from "react";

import { CodeWindow, CodeWindowMode } from "@/components/CodeWindow";
import * as cls from "./index.css";

type CodeSpaceProps = {
  mainCode: string;
  onMainCodeChange: (mainCode: string) => void;
};

export function CodeSpace({ mainCode, onMainCodeChange }: CodeSpaceProps) {
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
      </div>
    </div>
  );
}
