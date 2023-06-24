import {
  EditorView,
  Decoration,
  GutterMarker,
  gutterLineClass,
} from "@codemirror/view";
import { StateField, StateEffect, RangeSet, Range } from "@codemirror/state";

const ERROR_LINE_CLASS = "error-line";
const ERROR_LINE_GUTTER_CLASS = "error-line-gutter";

export const setErrorLine = StateEffect.define<number>();
export const clearErrorLine = StateEffect.define();

const errorLineMark = Decoration.line({
  class: ERROR_LINE_CLASS,
});

const errorLineField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(errorLines, tr) {
    errorLines = errorLines.map(tr.changes);

    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        errorLines = RangeSet.of(errorLineMark.range(e.value));
      } else if(e.is(clearErrorLine)) {
        errorLines = RangeSet.empty;
      }
    }

    return errorLines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const errorLineGutterMark = new (class extends GutterMarker {
  elementClass = ERROR_LINE_GUTTER_CLASS;
})();

const errorLineGutter = gutterLineClass.compute([errorLineField], (state) => {
  const marks: Range<GutterMarker>[] = [];
  const errorLine = state.field(errorLineField);

  errorLine.between(0, Number.MAX_VALUE, (p) => {
    marks.push(errorLineGutterMark.range(p));
  });

  return RangeSet.of(marks);
});

const errorLineTheme = EditorView.theme({
  [`& .${ERROR_LINE_CLASS}, & .${ERROR_LINE_GUTTER_CLASS}`]: {
    backgroundColor: "#ffe3e3"
  },
});

export default [errorLineField, errorLineGutter, errorLineTheme];
