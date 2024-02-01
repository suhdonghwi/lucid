import { CodeMirror } from "./CodeMirror";
import { basicExtensions } from "./extensions";

import * as styles from "./index.css";

type CodeWindowProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function CodeWindow(props: CodeWindowProps) {
  return (
    <CodeMirror
      class={styles.rootContainer}
      extensions={basicExtensions}
      value={props.value}
      onValueChange={props.onValueChange}
    />
  );
}
