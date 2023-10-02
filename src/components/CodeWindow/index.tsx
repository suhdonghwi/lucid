import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import { extensions } from "./extensions";
import { clearError, setError } from "./extensions/errorDisplay";
import { clearLineRange, setLineRange } from "./extensions/lineRangeHighlight";

import * as cls from "./index.css";
import { cropPosRange, PosRange } from "@/schemas/PosRange";
import type { ExecError } from "@/schemas/ExecError";

const theme = githubLightInit({
  theme: "light",
  settings: {
    background: "white",
    gutterBackground: "rgba(255, 255, 255, 0.5)",
    fontFamily: "JetBrains Mono, monospace",
  },
});

export type CodeWindowMode =
  | { type: "normal" }
  | { type: "error"; error: ExecError }
  | { type: "eval"; range: PosRange };

type CodeWindowProps = {
  code: string;
  onCodeChange?: (code: string) => void;

  mode: CodeWindowMode;

  posRange?: PosRange;
};

export function CodeWindow({
  code,
  onCodeChange,
  mode,
  posRange,
}: CodeWindowProps) {
  const editorDiv = useRef<HTMLDivElement | null>(null);

  const croppedCode =
    posRange !== undefined ? cropPosRange(code, posRange) : code;
  const { setContainer, view } = useCodeMirror({
    // View dispatch does not occur if the value is same with view's internal state
    // (Refer "./useCodeMirror.ts")
    value: croppedCode,

    theme,
    extensions,
    readOnly: posRange !== undefined || onCodeChange === undefined,

    onChange: onCodeChange,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  useEffect(() => {
    if (view === null) return;

    switch (mode.type) {
      case "error":
        view.dispatch({
          effects: [setError.of(mode.error), clearLineRange.of(null)],
        });
        break;
      case "eval":
        view.dispatch({
          effects: [setLineRange.of(mode.range), clearError.of(null)],
        });
        break;
      default:
        view.dispatch({
          effects: [clearLineRange.of(null), clearError.of(null)],
        });
        break;
    }
  }, [view, mode]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
