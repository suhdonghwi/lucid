import { instrument, EventCallbacks } from "../instrument";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  eventCallbacks?: EventCallbacks;
};

const createCodeBlob = (input: string) =>
  new Blob([input], { type: "text/javascript" });

export async function execute(code: string) {
  const eventCallbacksIdentifier = "eventCallbacks";

  (globalThis as GlobalThisWithEventCallbacks)[eventCallbacksIdentifier] = {
    onFunctionEnter: () => console.log("onFunctionEnter"),
    onFunctionLeave: () => console.log("onFunctionLeave"),
  } as EventCallbacks;

  const instrumentedCode = instrument(code, {
    eventCallbacksIdentifier,
  });
  console.log(instrumentedCode);

  const codeBlob = createCodeBlob(instrumentedCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete (globalThis as GlobalThisWithEventCallbacks)[eventCallbacksIdentifier];
}
