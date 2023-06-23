import { container } from "./App.css";

import CodeRunner from "./components/CodeRunner";

function App() {
  return (
    <div className={container}>
      <CodeRunner />
    </div>
  );
}

export default App;
