import { createCodeMirror } from "./createCodeMirror";
import { basicExtensions } from "./extensions";

export function CodeWindow() {
  const { ref: editorRef } = createCodeMirror({
    initialValue: "console.log('hello world!')",
    onValueChange: (value) => console.log("value changed", value),
    extensions: basicExtensions,
  });

  return <div ref={editorRef} />;
}
