import { useRef, useEffect } from "react";

import * as View from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";

import { python } from "@codemirror/lang-python";

import { useCodeMirror } from "@uiw/react-codemirror";
import { githubLightInit } from "@uiw/codemirror-theme-github";

import { useEvalHighlight, evalHighlighting } from "./evalHighlighting";
import errorDisplay, { clearError, setError } from "./errorDisplay";

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
  View.highlightActiveLine(),
  View.highlightActiveLineGutter(),
  python(),
  cssTheme,
  evalHighlighting,
  errorDisplay,
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
  const editor = useRef<HTMLDivElement | null>(null);

  const { setContainer, view } = useCodeMirror({
    className: cls.editor,

    // Not actually a 2-way binding
    // But view dispatch does not occur if the value is same with view's internal state
    // Reference: https://github.com/uiwjs/react-codemirror/blob/8a14a69d5bafdc6abdb14a90302031594771c5a3/core/src/useCodeMirror.ts#L160-L167
    value: code,

    height: "100%",
    theme,
    extensions,
    basicSetup: false,
    onChange: onCodeUpdate,
    container: editor.current,
  });

  useEffect(() => {
    if (editor.current) setContainer(editor.current);
  }, [setContainer]);

  useEffect(() => {
    if (!view) return;

    switch (mode.type) {
      case "error":
        view.dispatch({ effects: setError.of(mode.error) });
        break;
      default:
        view.dispatch({ effects: clearError.of(null) });
    }
  }, [view, mode]);

  const highlightScope = useEvalHighlight({
    range:
      mode.type === "eval" ? mode.trackData[mode.currentStep].evalRange : null,
    editorView: view ?? null,
    editorElement: editor.current,
  });

  return (
    <div ref={highlightScope} className={cls.rootContainer}>
      <div ref={editor} />
    </div>
  );
}

export default CodeEditor;
