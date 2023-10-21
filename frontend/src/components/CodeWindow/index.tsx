import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";
import { useCodeMirror } from "./useCodeMirror";

import * as cls from "./index.css";
import { cropPosRange, PosRange } from "@/schemas/PosRange";

import { useBasicExtensions } from "./hooks";

const theme = githubLightInit({
  theme: "light",
  settings: {
    background: "white",
    gutterBackground: "transparent",
    fontFamily: "JetBrains Mono, monospace",
  },
});

type CodeWindowProps = {
  code: string;
  onCodeChange?: (code: string) => void;

  posRange?: PosRange;
};

export function CodeWindow({ code, onCodeChange, posRange }: CodeWindowProps) {
  const editorDiv = useRef<HTMLDivElement | null>(null);

  const startLineno = posRange?.lineno ?? 1;
  const basicExtensions = useBasicExtensions(startLineno);

  const croppedCode =
    posRange === undefined ? code : cropPosRange(code, posRange);

  const { setContainer } = useCodeMirror({
    // NOTE: View dispatch does not occur if the value is same with view's internal state
    // (Refer "./useCodeMirror.ts")
    value: croppedCode,

    theme,
    extensions: basicExtensions,
    readOnly: onCodeChange === undefined,

    onChange: onCodeChange,
  });

  useEffect(() => {
    if (editorDiv.current) setContainer(editorDiv.current);
  }, [setContainer]);

  return <div className={cls.rootContainer} ref={editorDiv} />;
}
