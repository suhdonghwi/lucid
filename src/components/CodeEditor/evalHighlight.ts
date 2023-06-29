import {
  EditorView,
  layer,
  RectangleMarker,
  ViewUpdate,
  ViewPlugin,
  PluginValue,
} from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

import gsap from "gsap";

import { EvalRange, TrackData } from "@/TrackData";

const EVAL_HIGHLIGHT_LAYER_CLASS = "cm-eval-highlight-layer";
const EVAL_HIGHLIGHT_CLASS = "cm-eval-highlight";

export const setEvalRange = StateEffect.define<TrackData>();
export const clearEvalRange = StateEffect.define();

const highlightLayer = layer({
  class: EVAL_HIGHLIGHT_LAYER_CLASS,
  above: false,
  update: () => false,
  markers: () => [new RectangleMarker(EVAL_HIGHLIGHT_CLASS, 0, 0, 0, 0)],
});

class HighlightPlugin implements PluginValue {
  highlightElement: Element | null = null;

  animateHighlight(range: EvalRange, view: EditorView) {
    if (this.highlightElement === null) return;

    const startPos = view.state.doc.line(range.line).from + range.col;
    const endPos = view.state.doc.line(range.endLine).from + range.endCol;

    const startCoords = view.coordsAtPos(startPos);
    const endCoords = view.coordsAtPos(endPos);

    const viewRect = view.dom.getBoundingClientRect();

    if (startCoords && endCoords) {
      gsap.to(this.highlightElement, {
        x: startCoords.left - viewRect.left,
        y: startCoords.top - viewRect.top,
        width: endCoords.left - startCoords.left,
        height: startCoords.bottom - startCoords.top,
      });
    }
  }

  update(vu: ViewUpdate) {
    if (this.highlightElement === null) {
      this.highlightElement =
        vu.view.dom.getElementsByClassName(EVAL_HIGHLIGHT_CLASS)[0] ?? null;
    }

    for (const tr of vu.transactions) {
      for (const e of tr.effects) {
        if (e.is(setEvalRange)) {
          const range = e.value.evalRange;
          vu.view.requestMeasure({
            read: (view) => this.animateHighlight(range, view),
          });
        } else if (e.is(clearEvalRange)) {
          // ?
        }
      }
    }
  }
}

const highlightPlugin = ViewPlugin.fromClass(HighlightPlugin);

const highlightTheme = EditorView.theme({
  [`& .${EVAL_HIGHLIGHT_LAYER_CLASS} .${EVAL_HIGHLIGHT_CLASS}`]: {
    backgroundColor: "#ffe066",
    borderRadius: "3px",
  },
});

export default [highlightLayer, highlightPlugin.extension, highlightTheme];
