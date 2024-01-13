import { createCodeMirror } from "./createCodeMirror";

export function CodeWindow() {
  const { ref: editorRef } = createCodeMirror({
    value: "console.log('hello world!')",
    onValueChange: (value) => console.log("value changed", value),
    onModelViewUpdate: (modelView) =>
      console.log("modelView updated", modelView),
  });

  return <div ref={editorRef} />;
}
