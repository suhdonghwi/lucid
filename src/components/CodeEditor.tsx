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
          style={{ ...style, backgroundColor: "transparent" }}
        >
          {tokens.map((line, i) => {
            const lineNumber = i + 1;
            const isErrorLine =
              error && error.line <= lineNumber && lineNumber <= error.end_line;
            return (
              <React.Fragment key={i}>
                <div className={cls.lineNumber}>{lineNumber}</div>
                <div
                  {...getLineProps({
                    line,
                    className: `${isErrorLine ? cls.errorLine : ""}`,
                  })}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              </React.Fragment>
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
