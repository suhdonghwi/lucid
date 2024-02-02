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
    value: code,
    onChange: onCodeChange,

    extensions: basicExtensions,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
