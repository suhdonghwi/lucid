import { useRef, useEffect, useState } from "react";

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
  // `editorDiv` is a reference to the editor element, which may be empty. (not initialized by CodeMirror yet)
  // However, `editorElement` is a state variable that stores the initialized element.
  // `editorDiv` and `editorElement` would refer to the same element eventually,
  // but they become non-null at different times.
  const editorDiv = useRef<HTMLDivElement | null>(null);
  const [editorElement, setEditorElement] = useState<HTMLElement | null>(null);

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
    onCreateEditor: (view) => {
      setEditorElement(view.dom);
    },
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  useEffect(() => {
    if (view === undefined) return;

    switch (mode.type) {
      case "error":
        view.dispatch({ effects: setError.of(mode.error) });
        break;
      default:
        view.dispatch({ effects: clearError.of(null) });
    }
  }, [view, mode]);

  const evalRange =
    mode.type === "eval" ? mode.trackData[mode.currentStep].evalRange : null;
  const highlightScope = useEvalHighlight({
    range: evalRange,
    editorView: view ?? null,
    editorElement,
  });

  return (
    <div ref={highlightScope} className={cls.rootContainer}>
      <div ref={editorDiv} />
    </div>
  );
}

export default CodeEditor;
