import { useState } from "react";

import { Repository } from "@/data/repository";

import { RepositoryEditor } from "./components/RepositoryEditor";

const INITIAL_CODE = `function add(a, b) {
  return a + b;
}

console.log(add(1, 2));`;

function App() {
  const [repository, setRepository] = useState(
    new Repository().setFile({
      path: "index.js",
      content: INITIAL_CODE,
    }),
  );

  return (
    <RepositoryEditor
      repository={repository}
      onChange={(path, code) => {
        setRepository(repository.setFile({ path, content: code }));
      }}
    />
  );
}

export default App;
