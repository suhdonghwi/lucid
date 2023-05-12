import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

import * as cls from "./CodeEditor.css";

import { RunError } from "../RunError";

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;

  error: RunError | null;
};

function CodeEditor({ code, onCodeUpdate, error }: CodeEditorProps) {
  return (
    <div className={cls.rootContainer}>
      <CodeMirror
        value={code}
        height="200px"
        extensions={[python()]}
        onChange={onCodeUpdate}
      />
    </div>
  );
}

export default CodeEditor;
