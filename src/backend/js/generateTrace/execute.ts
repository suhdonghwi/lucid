import { Repository } from "@/repository";

import { EventCallbacks } from "../instrument";

function createCodeBlob(input: string) {
  return new Blob([input], { type: "text/javascript" });
}

export async function execute(
  repo: Repository,
  eventCallbacks: EventCallbacks,
  eventCallbacksIdentifier: string,
) {
  const entryCode = repo.getContent("index.js");
  if (entryCode === undefined) {
    throw new Error("Entry file not found");
  }

  console.log("entry code:\n", entryCode);

  // @ts-expect-error eventCallbacksIdentifier is not a valid property on globalThis
  globalThis[eventCallbacksIdentifier] = eventCallbacks;

  const codeBlob = createCodeBlob(entryCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  // @ts-expect-error eventCallbacksIdentifier is not a valid property on globalThis
  delete globalThis[eventCallbacksIdentifier];
}
