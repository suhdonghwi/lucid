import * as View from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";

const cssTheme = View.EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },

  "& .cm-gutters": {
    border: "none",

    "& .cm-gutterElement": {
      minWidth: "30px",
      padding: "0 7px",
    },
  },

  "&": {
    height: "100%",
  },
});

import errorDisplay from "./errorDisplay";
import lineRangeHighlight from "./lineRangeHighlight";

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
  lineRangeHighlight,
];
