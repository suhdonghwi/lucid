import * as View from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";

const cssTheme = View.EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
});

import errorDisplay from "./errorDisplay";
import evalHighlight from "./evalHighlight";

export default [
  View.keymap.of(Commands.defaultKeymap),
  View.lineNumbers(),
  View.EditorView.lineWrapping,
  Commands.history(),
  View.drawSelection(),
  View.dropCursor(),
  Language.indentOnInput(),
  Language.bracketMatching(),
  Autocomplete.closeBrackets(),
  python(),
  cssTheme,
  errorDisplay,
  evalHighlight,
];