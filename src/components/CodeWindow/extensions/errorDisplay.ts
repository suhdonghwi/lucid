import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect, RangeSet } from "@codemirror/state";

import type { ExecError } from "@/schemas/ExecError";

const ERROR_LINE_CLASS = "error-line";
const ERROR_LINE_GUTTER_CLASS = "error-line-gutter";
const ERROR_OFFSET_RANGE_CLASS = "error-offset-range";

export const setError = StateEffect.define<ExecError>();
export const clearError = StateEffect.define();

const errorLineMark = Decoration.line({
  class: ERROR_LINE_CLASS,
});

const errorOffsetRangeMark = Decoration.mark({
  class: ERROR_OFFSET_RANGE_CLASS,
});

// Reference: https://github.com/python/cpython/blob/4849a80dd1cbbc5010e8749ba60eb91a541ae4e7/Python/traceback.c#L595C4-L595C4
function isWhitespace(ch: string) {
  return ch == " " || ch == "\t" || ch == "\f";
}

const errorField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(errorLines, tr) {
    errorLines = errorLines.map(tr.changes);

    for (const e of tr.effects) {
      if (e.is(setError)) {
        const range = e.value.range;
        const newDoc = tr.newDoc;

        const marks = [];

        // If it is a multi-line expression, then we will highlight
        // until the last non-whitespace character of the starting line.
        // Reference: https://github.com/python/cpython/blob/4849a80dd1cbbc5010e8749ba60eb91a541ae4e7/Python/traceback.c#L853-L867
        if (range.lineno !== range.endLineno) {
          range.endLineno = range.lineno;

          const lineText = newDoc.line(range.lineno).text;
          range.endCol = lineText.length + 1;

          while (range.endCol > 0 && isWhitespace(lineText[range.endCol - 1])) {
            range.endCol--;
          }
        }

        if (range.col && range.endCol && range.col < range.endCol) {
          const from = newDoc.line(range.lineno).from + range.col - 1;
          const to = newDoc.line(range.endLineno).from + range.endCol - 1;
          marks.push(errorOffsetRangeMark.range(from, to));
        }

        for (let l = range.lineno; l <= range.endLineno; l++) {
          const pos = newDoc.line(l).from;
          marks.push(errorLineMark.range(pos));
        }

        errorLines = RangeSet.of(marks, true);
      } else if (e.is(clearError)) {
        errorLines = RangeSet.empty;
      }
    }

    return errorLines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const errorDisplayTheme = EditorView.theme({
  [`& .${ERROR_LINE_CLASS}, & .${ERROR_LINE_GUTTER_CLASS}`]: {
    backgroundColor: "#ff000015",
  },
  [`& .${ERROR_OFFSET_RANGE_CLASS}`]: {
    borderBottom: "1.5px solid red",
  },
});

export default [errorField, errorDisplayTheme];
