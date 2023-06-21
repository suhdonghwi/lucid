import React from "react";

import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { githubLightInit } from "@uiw/codemirror-theme-github";

import * as cls from "./CodeEditor.css";

import { RunError } from "../RunError";

const theme = EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
});

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;

  error: RunError | null;
};

function CodeEditor({ code, onCodeUpdate, error }: CodeEditorProps) {
  return (
    <div className={cls.rootContainer}>
      <CodeMirror
        className={cls.editor}
        value={code}
        height="100%"
        theme={githubLightInit({
          theme: "light",
          settings: {
            background: "transparent",
            gutterBackground: "transparent",
            fontFamily: "Fira Mono, monospace",
          },
        })}
        extensions={[theme, python()]}
        basicSetup={{
          foldGutter: false,
          highlightSelectionMatches: false,
        }}
        onChange={onCodeUpdate}
      />
    </div>
  );
}

export default CodeEditor;
