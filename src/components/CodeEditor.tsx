import React, { useRef, useEffect } from "react";

import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { useCodeMirror } from "@uiw/react-codemirror";
import { githubLightInit } from "@uiw/codemirror-theme-github";

import * as cls from "./CodeEditor.css";
import { PosRange } from "../TrackData";

const cssStyle = EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
});

const extensions = [cssStyle, python()];

const theme = githubLightInit({
  theme: "light",
  settings: {
    background: "transparent",
    gutterBackground: "transparent",
    fontFamily: "Fira Mono, monospace",
  },
});

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;
  highlight: PosRange | null;
};

function CodeEditor({ code, onCodeUpdate, highlight }: CodeEditorProps) {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer, state, view } = useCodeMirror({
    className: cls.editor,
    value: code,
    height: "100%",
    theme,
    extensions,
    basicSetup: {
      foldGutter: false,
      highlightSelectionMatches: false,
    },
    onChange: onCodeUpdate,
    container: editor.current,
  });

  useEffect(() => {
    if (editor.current) setContainer(editor.current);
  }, [editor.current]);

  useEffect(() => {
    if (!highlight || !state) return;

    const pos1 = state.doc.line(highlight.line).from + highlight.col;
    const pos2 = state.doc.line(highlight.end_line).from + highlight.end_col;
    console.log(pos1, pos2);
  }, [highlight]);

  return (
    <div className={cls.rootContainer}>
      <div ref={editor} />
    </div>
  );
}

export default CodeEditor;
