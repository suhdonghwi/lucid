import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import * as cls from "./index.css";
import { cropPosRange, PosRange } from "@/schemas/PosRange";
import type { ExecError } from "@/schemas/ExecError";

import { useBasicExtensions, useLineRangeHighlight } from "./hooks";

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

  const startLineno = posRange?.lineno ?? 1;
  const basicExtensions = useBasicExtensions(startLineno);
  const {
    setEvalHighlightRange,
    clearEvalHighlightRange,
    rangeHighlightExtension,
  } = useLineRangeHighlight({ startLineno, highlightColor: "#fff3bf" });

  const croppedCode =
    posRange === undefined ? code : cropPosRange(code, posRange);

  const { setContainer, view } = useCodeMirror({
    // NOTE1: View dispatch does not occur if the value is same with view's internal state
    // (Refer "./useCodeMirror.ts")
    value: croppedCode,

    theme,
    extensions: [...basicExtensions, rangeHighlightExtension],
    readOnly: onCodeChange === undefined,

    onChange: onCodeChange,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  useEffect(() => {
    if (view === null) return;

    switch (mode.type) {
      case "error":
        break;
      case "eval": {
        view.dispatch({
          effects: [setEvalHighlightRange.of(mode.range)],
        });
        break;
      }
      default:
        view.dispatch({
          effects: [clearEvalHighlightRange.of(null)],
        });
        break;
    }
  }, [view, mode, posRange, clearEvalHighlightRange, setEvalHighlightRange]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
