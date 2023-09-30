import * as View from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";

const cssTheme = View.EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },

  "&": {
    height: "100%",
  },
});

import errorDisplay from "./errorDisplay";
import posRangeHighlight from "./posRangeHighlight";

export const extensions = [
  View.keymap.of(Commands.defaultKeymap),
  View.lineNumbers(),
  // View.EditorView.lineWrapping,
  Commands.history(),
  View.drawSelection(),
  View.dropCursor(),
  Language.indentOnInput(),
  Autocomplete.closeBrackets(),
  python(),
  cssTheme,
  errorDisplay,
  posRangeHighlight,
];
