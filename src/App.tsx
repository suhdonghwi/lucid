import React from "react";

import { container } from "./App.css";

import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <div className={container}>
      <CodeEditor />
    </div>
  );
}

export default App;
