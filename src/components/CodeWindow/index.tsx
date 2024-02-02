import { useRef, useEffect } from "react";

import { useCodeMirror } from "./useCodeMirror";
import { basicExtensions } from "./extensions";
import * as cls from "./index.css";

type CodeWindowProps = {
  code: string;
  onCodeChange?: (code: string) => void;
};

export function CodeWindow({ code, onCodeChange }: CodeWindowProps) {
  const editorDiv = useRef<HTMLDivElement | null>(null);

  const { setContainer } = useCodeMirror({
    // NOTE: View dispatch does not occur if the value is same with view's internal state
    value: code,
    extensions: basicExtensions,
    onChange: onCodeChange,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
