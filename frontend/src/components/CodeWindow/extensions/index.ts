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

export const getBasicExtensions = ({
  startLineno,
}: {
  startLineno: number;
}) => [
    View.keymap.of(Commands.defaultKeymap),
    View.lineNumbers({
      formatNumber: (line) => (line + startLineno - 1).toString(),
    }),
    // View.EditorView.lineWrapping,
    Commands.history(),
    View.drawSelection(),
    View.dropCursor(),
    Language.indentOnInput(),
    Autocomplete.closeBrackets(),
    python(),
    cssTheme,
  ];
