import React from "react";

import Highlight, { defaultProps } from "prism-react-renderer";

const exampleCode = `(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;`;

function CodeEditor() {
  return (
    <Highlight {...defaultProps} code={exampleCode} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
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

export default CodeEditor;
