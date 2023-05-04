import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";
import lightTheme from "prism-react-renderer/themes/github";

import * as cls from "./CodeEditor.css";
import CodeTextArea from "./CodeTextArea";

import { RunError } from "../RunError";

type CodeHighlightProps = {
  code: string;
  error: RunError | null;
};

function CodeHighlight({ code, error }: CodeHighlightProps) {
  return (
    <Highlight
      {...defaultProps}
      theme={lightTheme}
      code={code}
      language="python"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} ${cls.codeHighlight}`}
          style={{ ...style, background: "none" }}
        >
          {tokens.map((line, i) => {
            const isErrorLine =
              error && error.line <= i + 1 && i + 1 <= error.end_line;
            return (
              <div
                key={i}
                {...getLineProps({
                  line,
                  className: isErrorLine ? cls.errorLine : "",
                })}
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;

  error: RunError | null;
};

function CodeEditor({ code, onCodeUpdate, error }: CodeEditorProps) {
  return (
    <div className={cls.rootContainer}>
      <div className={cls.editorContainer}>
        <CodeHighlight code={code} error={error} />
        <CodeTextArea
          className={cls.codeTextArea}
          style={{ ...lightTheme.plain, backgroundColor: "transparent" }}
          value={code}
          onValueChange={onCodeUpdate}
          tabSize={2}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
