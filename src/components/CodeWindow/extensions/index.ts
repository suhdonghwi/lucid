import * as View from "@codemirror/view";
import * as Commands from "@codemirror/commands";
import * as Language from "@codemirror/language";
import * as Autocomplete from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { githubLightInit } from "@uiw/codemirror-theme-github";

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

const githubLightTheme = githubLightInit({
  theme: "light",
  settings: {
    background: "white",
    gutterBackground: "transparent",
    fontFamily: "JetBrains Mono, monospace",
  },
});

export const basicExtensions = [
  View.keymap.of(Commands.defaultKeymap),
  View.lineNumbers(),
  View.drawSelection(),
  View.dropCursor(),
  Commands.history(),
  Language.indentOnInput(),
  Autocomplete.closeBrackets(),
  javascript(),
  cssTheme,
  githubLightTheme,
];
