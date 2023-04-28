import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";
import lightTheme from "prism-react-renderer/themes/github";

import * as style from "./CodeEditor.css";

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
          className={`${className} ${style.codeHighlight}`}
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
  code: string,
  onCodeUpdate: (code: string) => void
};

function CodeEditor({code, onCodeUpdate}: CodeEditorProps) {
  return (
    <div className={style.rootContainer}>
      <div className={style.codeEditorContainer}>
        <textarea
          className={style.codeEditor}
          value={code}
          onChange={(e) => onCodeUpdate(e.target.value)}
          style={lightTheme.plain}
        />
      </div>
      <div className={style.codeHighlightContainer}>
        <CodeHighlight code={code} />
      </div>
    </div>
  );
}

export default CodeEditor;
