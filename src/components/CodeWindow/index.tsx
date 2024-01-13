import { createCodeMirror } from "./createCodeMirror";
import { basicExtensions } from "./extensions";

import * as styles from "./index.css";

type CodeWindowProps = {
  initialValue: string;
  onValueChange: (value: string) => void;
};

export function CodeWindow(props: CodeWindowProps) {
  const { ref: editorRef } = createCodeMirror({
    initialValue: props.initialValue,
    onValueChange: props.onValueChange,
    extensions: basicExtensions,
  });

  return <div class={styles.rootContainer} ref={editorRef} />;
}
