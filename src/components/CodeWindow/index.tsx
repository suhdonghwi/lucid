import { createCodeMirror } from "./createCodeMirror";

export function CodeWindow() {
  const { ref: editorRef } = createCodeMirror({
    /**
     * The initial value of the editor
     */
    value: "console.log('hello world!')",
    /**
     * Fired whenever the editor code value changes.
     */
    onValueChange: (value) => console.log("value changed", value),
    /**
     * Fired whenever a change occurs to the document, every time the view updates.
     */
    onModelViewUpdate: (modelView) =>
      console.log("modelView updated", modelView),
  });

  return <div ref={editorRef} />;
}
