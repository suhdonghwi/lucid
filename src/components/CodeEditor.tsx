import React, { useState } from "react";

import Highlight, { defaultProps } from "prism-react-renderer";

import {
  rootContainer,
  codeHighlightContainer,
  codeEditorContainer,
  codeHighlight,
  codeEditor,
} from "./CodeEditor.css";

const exampleCode = `(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;`;

type CodeHighlightProps = {
  code: string;
};

function CodeHighlight({ code }: CodeHighlightProps) {
  return (
    <Highlight {...defaultProps} code={code} language="jsx">
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
        />
      </div>
      <div className={codeHighlightContainer}>
        <CodeHighlight code={code} />
      </div>
    </div>
  );
}

export default CodeEditor;
