import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import { extensions } from "./extensions";
import { clearError, setError } from "./extensions/errorDisplay";
import { clearEvalRange, setEvalRange } from "./extensions/evalHighlight";

import * as cls from "./index.css";
import { RunError } from "@/RunError";
import { CodeRange } from "@/CodeRange";

const theme = githubLightInit({
  theme: "light",
  settings: {
    background: "transparent",
    gutterBackground: "transparent",
    fontFamily: "JetBrains Mono, monospace",
  },
});

export type CodeEditorMode =
  | { type: "normal" }
  | { type: "error"; error: RunError }
  | { type: "eval"; range: CodeRange };

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;
  mode: CodeEditorMode;
};

function CodeEditor({ code, onCodeUpdate, mode }: CodeEditorProps) {
  const editorDiv = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    // View dispatch does not occur if the value is same with view's internal state
    // (Refer "./useCodeMirror.ts")
    value: code,

    theme,
    extensions,
    readOnly: false,

    onChange: onCodeUpdate,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  useEffect(() => {
    if (view === null) return;

    switch (mode.type) {
      case "error":
        view.dispatch({
          effects: [setError.of(mode.error), clearEvalRange.of(null)],
        });
        break;
      case "eval":
        view.dispatch({
          effects: [setEvalRange.of(mode.range), clearError.of(null)],
        });
        break;
      default:
        view.dispatch({ effects: clearError.of(null) });
    }
  }, [view, mode]);

  return (
    <div className={cls.rootContainer}>
      <div ref={editorDiv} />
    </div>
  );
}

export default CodeEditor;
