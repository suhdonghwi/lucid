import { CodeWindow } from "../CodeWindow";
import * as styles from "./index.css";

export function ExecutionController() {
  return (
    <div class={styles.rootContainer}>
      <div class={styles.windowContainer}>
        <CodeWindow />
      </div>
    </div>
  );
}
