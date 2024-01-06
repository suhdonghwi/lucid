import { EventCallbacks } from "../instrument";
import { instrument } from "../instrument";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  eventCallbacks?: EventCallbacks;
};

const globalThisWithEventCallbacks = globalThis as GlobalThisWithEventCallbacks;

const EVENT_CALLBACKS_IDENTIFIER = "eventCallbacks";

function createCodeBlob(input: string) {
  return new Blob([input], { type: "text/javascript" });
}

export async function execute(code: string) {
  const { result: instrumentedCode, indexedNodes } = instrument(code, {
    sourceFileIndex: 0,
    eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
  });
  console.log("instrumented code:\n", instrumentedCode);

  globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER] = {
    onFunctionEnter: (sourceFileIndex: number, nodeIndex: number) =>
      console.log("onFunctionEnter", indexedNodes[nodeIndex]),
    onFunctionLeave: (sourceFileIndex: number, nodeIndex: number) =>
      console.log("onFunctionLeave", indexedNodes[nodeIndex]),
  } as EventCallbacks;

  const codeBlob = createCodeBlob(instrumentedCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER];
}
