import { instrument, EventCallbacks } from "../instrument";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  eventCallbacks?: EventCallbacks;
};

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

const EVENT_CALLBACKS_IDENTIFIER = "eventCallbacks";

export async function execute(code: string) {
  const { result: instrumentedCode, indexedNodes } = instrument(code, {
    eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
  });
  console.log("instrumented code:\n", instrumentedCode);

  (globalThis as GlobalThisWithEventCallbacks)[EVENT_CALLBACKS_IDENTIFIER] = {
    onFunctionEnter: (nodeIndex: number) =>
      console.log("onFunctionEnter", indexedNodes[nodeIndex]),
    onFunctionLeave: (nodeIndex: number) =>
      console.log("onFunctionLeave", indexedNodes[nodeIndex]),
  } as EventCallbacks;

  const codeBlob = createCodeBlob(instrumentedCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete (globalThis as GlobalThisWithEventCallbacks)[
    EVENT_CALLBACKS_IDENTIFIER
  ];
}
