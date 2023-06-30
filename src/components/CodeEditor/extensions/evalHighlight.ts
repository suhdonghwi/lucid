import {
  EditorView,
  layer,
  RectangleMarker,
  ViewUpdate,
  ViewPlugin,
  PluginValue,
} from "@codemirror/view";
import { EditorSelection, StateEffect } from "@codemirror/state";

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
  markers: () =>
    [0, 1, 2].map(() => new RectangleMarker(EVAL_HIGHLIGHT_CLASS, 0, 0, 0, 0)),
});

function rectangleMarkerToRect(marker: RectangleMarker) {
  // Currently properties like `left` and `width` in `RectangleMarker` are private.
  // Used a hack to access private members, need to fix later on.
  return {
    x: marker["left"] as number,
    y: marker["top"] as number,
    width: marker["width"] as number,
    height: marker["height"] as number,
  };
}

class HighlightPluginValue implements PluginValue {
  highlights: {
    top: Element;
    middle: Element;
    bottom: Element;
  } | null = null;

  animateHighlight(range: EvalRange, view: EditorView) {
    if (this.highlights === null) return;

    const startLine = view.state.doc.line(range.line);
    const endLine = view.state.doc.line(range.endLine);

    const startPos = startLine.from + range.col;
    const endPos = endLine.from + range.endCol;

    const rects = RectangleMarker.forRange(
      view,
      "",
      EditorSelection.range(startPos, endPos)
    ).map(rectangleMarkerToRect);

    if (rects.length === 1) {
      gsap.to(
        [this.highlights.top, this.highlights.middle, this.highlights.bottom],
        { opacity: 1, ...rects[0] }
      );
    } else if (rects.length === 2) {
      gsap.to(this.highlights.top, { opacity: 1, ...rects[0] });
      gsap.to([this.highlights.bottom, this.highlights.middle], {
        opacity: 1,
        ...rects[1],
      });
    } else if (rects.length === 3) {
      gsap.to(this.highlights.top, { opacity: 1, ...rects[0] });
      gsap.to(this.highlights.middle, { opacity: 1, ...rects[1] });
      gsap.to(this.highlights.bottom, { opacity: 1, ...rects[2] });
    }
  }

  update(vu: ViewUpdate) {
    if (this.highlights === null) {
      const elems = vu.view.dom.getElementsByClassName(EVAL_HIGHLIGHT_CLASS);

      if (elems.length === 3) {
        const [top, middle, bottom] = elems;
        this.highlights = { top, middle, bottom };
      } else return;
    }

    for (const tr of vu.transactions) {
      for (const e of tr.effects) {
        if (e.is(setEvalRange)) {
          vu.view.requestMeasure({
            read: (view) => this.animateHighlight(e.value.evalRange, view),
          });
        } else if (e.is(clearEvalRange)) {
          gsap.to(
            [
              this.highlights.top,
              this.highlights.middle,
              this.highlights.bottom,
            ],
            { opacity: 0, width: 0, height: 0 }
          );
        }
      }
    }
  }
}

const highlightPlugin = ViewPlugin.fromClass(HighlightPluginValue);

const highlightTheme = EditorView.theme({
  [`& .${EVAL_HIGHLIGHT_LAYER_CLASS} .${EVAL_HIGHLIGHT_CLASS}`]: {
    backgroundColor: "#ffe066",
    borderRadius: "3px",
  },
});

export default [highlightLayer, highlightPlugin.extension, highlightTheme];
