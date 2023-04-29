import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";
import lightTheme from "prism-react-renderer/themes/github";

import * as cls from "./CodeEditor.css";

type CodeHighlightProps = {
  code: string;
};

function CodeHighlight({ code }: CodeHighlightProps) {
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
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;
};

function CodeEditor({ code, onCodeUpdate }: CodeEditorProps) {
  return (
    <div className={cls.rootContainer}>
      <div className={cls.editorContainer}>
        <textarea
          className={cls.codeTextArea}
          value={code}
          onChange={(e) => onCodeUpdate(e.target.value)}
          style={lightTheme.plain}
        />
        <CodeHighlight code={code} />
      </div>
    </div>
  );
}

export default CodeEditor;
