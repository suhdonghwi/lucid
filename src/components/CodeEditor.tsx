import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";
import lightTheme from "prism-react-renderer/themes/github";

import * as cls from "./CodeEditor.css";
import CodeTextArea from "./CodeTextArea";

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
        <CodeTextArea
          className={cls.codeTextArea}
          style={lightTheme.plain}
          value={code}
          onValueChange={onCodeUpdate}
          tabSize={2}
        />
        <CodeHighlight code={code} />
      </div>
    </div>
  );
}

export default CodeEditor;
