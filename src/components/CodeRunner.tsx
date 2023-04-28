import React, { useState } from "react";

import CodeEditor from "./CodeEditor";

const exampleCode = `def f():
  while True:
    print("Hello, world!")

f()`;

function CodeRunner() {
  const [code, setCode] = useState(exampleCode);

  return <CodeEditor code={code} onCodeUpdate={(code) => setCode(code)} />;
}

export default CodeRunner;
