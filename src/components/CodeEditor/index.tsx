import { useRef, useEffect } from "react";

import * as View from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import errorDisplay, { clearError, setError } from "./errorDisplay";
import evalHighlight, { clearEvalRange, setEvalRange } from "./evalHighlight";

import * as cls from "./index.css";
import { TrackData } from "@/TrackData";
import RunError from "@/RunError";

const cssTheme = EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
});

const extensions = [
  View.keymap.of(Commands.defaultKeymap),
  View.lineNumbers(),
  EditorView.lineWrapping,
  Commands.history(),
  View.drawSelection(),
  View.dropCursor(),
  Language.indentOnInput(),
  Language.bracketMatching(),
  Autocomplete.closeBrackets(),
  python(),
  cssTheme,
  errorDisplay,
  evalHighlight,
];

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
  | { type: "eval"; trackData: TrackData[]; currentStep: number };

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;
  mode: CodeEditorMode;
};

function CodeEditor({ code, onCodeUpdate, mode }: CodeEditorProps) {
  const editorDiv = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    // Not actually a 2-way binding
    // But view dispatch does not occur if the value is same with view's internal state
    // Reference: https://github.com/uiwjs/react-codemirror/blob/8a14a69d5bafdc6abdb14a90302031594771c5a3/core/src/useCodeMirror.ts#L160-L167
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
          effects: [
            setEvalRange.of(mode.trackData[mode.currentStep]),
            clearError.of(null),
          ],
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
