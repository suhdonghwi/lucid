import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import { basicExtensions } from "./extensions";
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
    posRange === undefined ? code : cropPosRange(code, posRange);

  const { setContainer, view } = useCodeMirror({
    // NOTE1: View dispatch does not occur if the value is same with view's internal state
    // (Refer "./useCodeMirror.ts")
    value: croppedCode,

    theme,
    extensions: basicExtensions(posRange),
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
        view.dispatch({
          effects: [setError.of(mode.error), clearLineRange.of(null)],
        });
        break;
      case "eval": {
        const adjustedPosRange: PosRange =
          posRange === undefined
            ? mode.range
            : {
              ...mode.range,
              lineno: mode.range.lineno - posRange.lineno + 1,
              endLineno: mode.range.endLineno - posRange.lineno + 1,
            };

        view.dispatch({
          effects: [setLineRange.of(adjustedPosRange), clearError.of(null)],
        });
        break;
      }
      default:
        view.dispatch({
          effects: [clearLineRange.of(null), clearError.of(null)],
        });
        break;
    }
  }, [view, mode, posRange]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
