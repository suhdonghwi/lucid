import { useRef, useEffect } from "react";

import { useAnimate } from "framer-motion";

import { EditorView, layer, RectangleMarker } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { useCodeMirror } from "@uiw/react-codemirror";
import { githubLightInit } from "@uiw/codemirror-theme-github";

import * as cls from "./CodeEditor.css";
import { PosRange } from "../TrackData";

const evalHighlightLayerClassName = "eval-highlight-layer";
const evalHighlightClassName = "eval-highlight";

const cssStyle = EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
  [`& .${evalHighlightClassName}`]: {
    backgroundColor: "#ffe066",
    borderRadius: "3px",
  },
});

const evalHighlightLayer = layer({
  class: evalHighlightLayerClassName,
  above: false,
  update: () => true,
  markers: () => {
    return [new RectangleMarker(evalHighlightClassName, 0, 0, 0, 0)];
  },
});

const extensions = [cssStyle, python(), evalHighlightLayer];

const theme = githubLightInit({
  theme: "light",
  settings: {
    background: "transparent",
    gutterBackground: "transparent",
    fontFamily: "Fira Mono, monospace",
  },
});

type CodeEditorProps = {
  code: string;
  onCodeUpdate: (code: string) => void;
  highlight: PosRange | null;
};

function CodeEditor({ code, onCodeUpdate, highlight }: CodeEditorProps) {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer, view } = useCodeMirror({
    className: cls.editor,

    // Not actually a 2-way binding
    // But view dispatch does not occur if the value is same with view's internal state
    // Reference: https://github.com/uiwjs/react-codemirror/blob/8a14a69d5bafdc6abdb14a90302031594771c5a3/core/src/useCodeMirror.ts#L160-L167
    value: code,

    height: "100%",
    theme,
    extensions,
    basicSetup: {
      foldGutter: false,
      highlightSelectionMatches: false,
    },
    onChange: onCodeUpdate,
    container: editor.current,
  });

  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (editor.current) setContainer(editor.current);
  }, [editor.current]);

  useEffect(() => {
    if (!(highlight && view)) return;

    const startPos = view.state.doc.line(highlight.line).from + highlight.col;
    const endPos =
      view.state.doc.line(highlight.endLine).from + highlight.endCol;

    const startCoords = view.coordsAtPos(startPos);
    const endCoords = view.coordsAtPos(endPos);

    if (startCoords && endCoords && editor.current) {
      const editorCoords = editor.current.getBoundingClientRect();

      animate(`.${evalHighlightClassName}`, {
        x: startCoords.left - editorCoords.left,
        y: startCoords.top - editorCoords.top,
        width: endCoords.left - startCoords.left,
        height: startCoords.bottom - startCoords.top,
      });
    }
  }, [highlight]);

  return (
    <div ref={scope} className={cls.rootContainer}>
      <div ref={editor} />
    </div>
  );
}

export default CodeEditor;
