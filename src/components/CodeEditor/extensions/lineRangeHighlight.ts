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

const ANIMATE_DURATION = 0.25;

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
  visible = false;

  animateHighlight(range: PosRange, view: EditorView) {
    if (this.highlightElement === undefined) return;

    const startLine = view.state.doc.line(range.lineno);
    const endLine = view.state.doc.line(range.endLineno);

    const startLineBlock = view.lineBlockAt(startLine.from);
    const endLineBlock = view.lineBlockAt(endLine.from);

    const rect = {
      left: 0,
      top: startLineBlock.top + view.documentPadding.top,
      width: view.scrollDOM.scrollWidth,
      height: endLineBlock.top - startLineBlock.top + endLineBlock.height,
    };

    if (!this.visible) {
      gsap.set(this.highlightElement, rect);
      gsap.to(this.highlightElement, {
        duration: ANIMATE_DURATION,
        opacity: 1,
      });
    } else {
      gsap.to(this.highlightElement, {
        duration: ANIMATE_DURATION,
        opacity: 1,
        ...rect,
      });
    }

    this.visible = true;
  }

  update(vu: ViewUpdate) {
    if (this.highlightElement === undefined) {
      const elems = vu.view.dom.getElementsByClassName(
        LINE_RANGE_HIGHLIGHT_CLASS
      );

      if (elems.length === 0) return;
      this.highlightElement = elems[0];
    }

    for (const transaction of vu.transactions) {
      for (const effect of transaction.effects) {
        if (effect.is(setLineRange)) {
          vu.view.requestMeasure({
            read: (view) => this.animateHighlight(effect.value, view),
          });
        } else if (effect.is(clearLineRange)) {
          gsap.to(this.highlightElement, {
            duration: ANIMATE_DURATION,
            opacity: 0,
          });
          this.visible = false;
        }
      }
    }
  }
}

const highlightPlugin = ViewPlugin.fromClass(HighlightPluginValue);

const highlightTheme = EditorView.theme({
  [`& .${LINE_RANGE_HIGHLIGHT_LAYER_CLASS} .${LINE_RANGE_HIGHLIGHT_CLASS}`]: {
    backgroundColor: "#ffec99",
    opacity: 0,
  },
});

export default [highlightLayer, highlightPlugin.extension, highlightTheme];
