import React, { useState } from "react";

import Highlight, { defaultProps } from "prism-react-renderer";
import lightTheme from "prism-react-renderer/themes/github";

import {
  rootContainer,
  codeHighlightContainer,
  codeEditorContainer,
  codeHighlight,
  codeEditor,
} from "./CodeEditor.css";

const exampleCode = `def f():
  while True:
    print("Hello, world!")

f()`;

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
          className={`${className} ${codeHighlight}`}
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

function CodeEditor() {
  const [code, setCode] = useState(exampleCode);

  return (
    <div className={rootContainer}>
      <div className={codeEditorContainer}>
        <textarea
          className={codeEditor}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={lightTheme.plain}
        />
      </div>
      <div className={codeHighlightContainer}>
        <CodeHighlight code={code} />
      </div>
    </div>
  );
}

export default CodeEditor;
