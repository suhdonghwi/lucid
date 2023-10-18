import {
  EditorView,
  layer,
  ViewUpdate,
  ViewPlugin,
  PluginValue,
} from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

import gsap from "gsap";

import type { PosRange } from "@/schemas/PosRange";

const HIGHLIGHT_LAYER_CLASS_PREFIX = "cm-line-range-highlight-layer";
const ANIMATE_DURATION = 0.25;

export function lineRangeHighlight({
  startLineno,
  highlightColor,
  id,
}: {
  startLineno: number;
  highlightColor: string;
  id: string;
}) {
  const setHighlightRange = StateEffect.define<PosRange>();
  const clearHighlight = StateEffect.define();

  const layerClassName = `${HIGHLIGHT_LAYER_CLASS_PREFIX}_${id}`;

  const highlightLayer = layer({
    class: layerClassName,
    above: false,
    update: () => false,
    markers: () => [],
  });

  const highlightLayerTheme = EditorView.theme({
    [`& .${layerClassName}`]: {
      backgroundColor: highlightColor,
      opacity: 0,
    },
  });

  const viewPlugin = ViewPlugin.fromClass(
    class implements PluginValue {
      highlightLayerElement?: Element = undefined;
      visible = false;

      animateHighlight(range: PosRange, view: EditorView) {
        if (this.highlightLayerElement === undefined) {
          console.error("highlight layer element is undefined");
          return;
        }

        const adjustedRange = {
          ...range,
          lineno: range.lineno - startLineno + 1,
          endLineno: range.endLineno - startLineno + 1,
        };

        const startLine = view.state.doc.line(adjustedRange.lineno);
        const endLine = view.state.doc.line(adjustedRange.endLineno);

        const startLineBlock = view.lineBlockAt(startLine.from);
        const endLineBlock = view.lineBlockAt(endLine.from);

        const rect = {
          left: 0,
          top: startLineBlock.top + view.documentPadding.top,
          width: view.scrollDOM.scrollWidth,
          height: endLineBlock.top - startLineBlock.top + endLineBlock.height,
        };

        if (!this.visible) {
          gsap.set(this.highlightLayerElement, rect);
          gsap.to(this.highlightLayerElement, {
            duration: ANIMATE_DURATION,
            opacity: 1,
          });

          this.visible = true;
        } else {
          gsap.to(this.highlightLayerElement, {
            duration: ANIMATE_DURATION,
            opacity: 1,
            ...rect,
          });
        }
      }

      update(vu: ViewUpdate) {
        if (this.highlightLayerElement === undefined) {
          const elems = vu.view.dom.getElementsByClassName(layerClassName);

          if (elems.length === 0) {
            console.error("highlight layer element not found");
            return;
          }
          this.highlightLayerElement = elems[0];
        }

        for (const transaction of vu.transactions) {
          for (const effect of transaction.effects) {
            if (effect.is(setHighlightRange)) {
              vu.view.requestMeasure({
                read: (view) => this.animateHighlight(effect.value, view),
              });
            } else if (effect.is(clearHighlight)) {
              gsap.to(this.highlightLayerElement, {
                duration: ANIMATE_DURATION,
                opacity: 0,
              });
              this.visible = false;
            }
          }
        }
      }
    }
  );

  return [
    setHighlightRange,
    clearHighlight,
    [highlightLayer, highlightLayerTheme, viewPlugin.extension],
  ] as const;
}
