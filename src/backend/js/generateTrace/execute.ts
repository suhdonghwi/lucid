import { IndexedAST } from "../indexing";
import { EventCallbacks, instrument } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  [EVENT_CALLBACKS_IDENTIFIER]?: EventCallbacks;
};

const globalThisWithEventCallbacks = globalThis as GlobalThisWithEventCallbacks;

function createCodeBlob(input: string) {
  return new Blob([input], { type: "text/javascript" });
}

export async function execute(
  code: string,
  createEventCallbacks: (indexedAST: IndexedAST) => EventCallbacks,
) {
  const { result: instrumentedCode, indexedAST } = instrument(code, {
    sourceIndex: 0,
    eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
  });
  console.log("instrumented code:\n", instrumentedCode);

  globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER] =
    createEventCallbacks(indexedAST);

  const codeBlob = createCodeBlob(instrumentedCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER];
}