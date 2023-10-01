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

import type { PosRange } from "@/schemas/PosRange";

const LINE_RANGE_HIGHLIGHT_LAYER_CLASS = "cm-line-range-highlight-layer";
const LINE_RANGE_HIGHLIGHT_CLASS = "cm-line-range-highlight";

export const setLineRange = StateEffect.define<PosRange>();
export const clearLineRange = StateEffect.define();

const highlightLayer = layer({
  class: LINE_RANGE_HIGHLIGHT_LAYER_CLASS,
  above: false,
  update: () => false,
  markers: () => [new RectangleMarker(LINE_RANGE_HIGHLIGHT_CLASS, 0, 0, 0, 0)],
});

class HighlightPluginValue implements PluginValue {
  highlightElement?: Element = undefined;

  animateHighlight(range: PosRange, view: EditorView) {
    if (this.highlightElement === undefined) return;

    const startLine = view.state.doc.line(range.lineno);
    const endLine = view.state.doc.line(range.endLineno);

    const startLineBlock = view.lineBlockAt(startLine.from);
    const endLineBlock = view.lineBlockAt(endLine.from);

    const rect = new RectangleMarker(
      LINE_RANGE_HIGHLIGHT_CLASS,
      0,
      startLineBlock.top + view.documentPadding.top,
      view.scrollDOM.scrollWidth,
      endLineBlock.top - startLineBlock.top + endLineBlock.height
    );

    gsap.to(this.highlightElement, { opacity: 1, duration: 0.25, ...rect });
  }

  update(vu: ViewUpdate) {
    if (this.highlightElement === undefined) {
      const elems = vu.view.dom.getElementsByClassName(
        LINE_RANGE_HIGHLIGHT_CLASS
      );

      // assert(elems.length === 1);
      this.highlightElement = elems[0];
    }

    for (const transaction of vu.transactions) {
      for (const effect of transaction.effects) {
        if (effect.is(setLineRange)) {
          vu.view.requestMeasure({
            read: (view) => this.animateHighlight(effect.value, view),
          });
        } else if (effect.is(clearLineRange)) {
          gsap.to(this.highlightElement, { opacity: 0, width: 0, height: 0 });
        }
      }
    }
  }
}

const highlightPlugin = ViewPlugin.fromClass(HighlightPluginValue);

const highlightTheme = EditorView.theme({
  [`& .${LINE_RANGE_HIGHLIGHT_LAYER_CLASS} .${LINE_RANGE_HIGHLIGHT_CLASS}`]: {
    backgroundColor: "#ffec99",
  },
});

export default [highlightLayer, highlightPlugin.extension, highlightTheme];
