import { useEffect } from "react";

import { layer, RectangleMarker, EditorView } from "@codemirror/view";

import { useAnimate } from "framer-motion";

import { PosRange } from "@/TrackData";

const HIGHLIGHT_LAYER_CLASS = "eval-highlight-layer";
const HIGHLIGHT_CLASS = "eval-highlight";

const highlightLayer = layer({
  class: HIGHLIGHT_LAYER_CLASS,
  above: false,
  update: () => false,
  markers: () => [new RectangleMarker(HIGHLIGHT_CLASS, 0, 0, 0, 0)],
});

const highlightTheme = EditorView.theme({
  [`& .${HIGHLIGHT_LAYER_CLASS} .${HIGHLIGHT_CLASS}`]: {
    backgroundColor: "#ffe066",
    borderRadius: "3px",
  },
});

export const evalHighlighting = [highlightLayer, highlightTheme];

export function useEvalHighlight({
  range,
  editorElement,
  editorView,
}: {
  range: PosRange | null;
  editorElement: HTMLDivElement | null;
  editorView: EditorView | null;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!(range && editorView)) return;

    const startPos = editorView.state.doc.line(range.line).from + range.col;
    const endPos = editorView.state.doc.line(range.endLine).from + range.endCol;

    const startCoords = editorView.coordsAtPos(startPos);
    const endCoords = editorView.coordsAtPos(endPos);

    if (startCoords && endCoords && editorElement) {
      const editorCoords = editorElement.getBoundingClientRect();

      animate(`.${HIGHLIGHT_CLASS}`, {
        x: startCoords.left - editorCoords.left,
        y: startCoords.top - editorCoords.top,
        width: endCoords.left - startCoords.left,
        height: startCoords.bottom - startCoords.top,
      });
    }
  }, [range, editorElement, editorView, animate]);

  return scope;
}
