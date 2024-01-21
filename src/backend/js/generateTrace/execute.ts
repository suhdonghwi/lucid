import { Repository } from "@/repository";

import { EventCallbacks } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  [EVENT_CALLBACKS_IDENTIFIER]?: EventCallbacks;
};

const globalThisWithEventCallbacks = globalThis as GlobalThisWithEventCallbacks;

function createCodeBlob(input: string) {
  return new Blob([input], { type: "text/javascript" });
}

export async function execute(
  repo: Repository,
  eventCallbacks: EventCallbacks,
) {
  const entryCode = repo.get("index.js");
  if (entryCode === undefined) {
    throw new Error("Entry file not found");
  }

  console.log("entry code:\n", entryCode);

  globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER] = eventCallbacks;

  const codeBlob = createCodeBlob(entryCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER];
}
