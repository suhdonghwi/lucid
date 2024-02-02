import { createSignal } from "solid-js";

import { Repository } from "./repository";

import { RepositoryEditor } from "./components/RepositoryEditor";

const INITIAL_CODE = `function add(a, b) {
  return a + b;
}

console.log(add(1, 2));`;

function App() {
  const [repository, setRepository] = createSignal(new Repository(), {
    equals: false,
  });

  repository().setFile({
    path: "index.js",
    content: INITIAL_CODE,
  });

  return (
    <RepositoryEditor
      repository={repository()}
      onChange={(path, code) => {
        repository().setFile({ path, content: code });
        setRepository(repository());
      }}
    />
  );
}

export default App;
