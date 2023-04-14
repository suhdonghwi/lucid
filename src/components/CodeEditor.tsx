import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";

import {
  rootContainer,
  codeViewerContainer,
  codeEditorContainer,
  codeViewerPre,
} from "./CodeEditor.css";

const exampleCode = `(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;`;

function CodeEditor() {
  return (
    <div className={rootContainer}>
      <div className={codeEditorContainer}></div>
      <div className={codeViewerContainer}>
        <Highlight {...defaultProps} code={exampleCode} language="jsx">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} ${codeViewerPre}`} style={style}>
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
      </div>
    </div>
  );
}

export default CodeEditor;
