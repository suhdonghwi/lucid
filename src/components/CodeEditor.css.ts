import { style } from "@vanilla-extract/css";

export const rootContainer = style({
  width: "30rem",
  height: "30rem",
  fontFamily: "Fira Mono, monospace",

  overflow: "auto",
});

export const editorContainer = style({
  position: "relative",
  minHeight: "100%",
  backgroundColor: "#f8f9fa",
});

const codeBase = style({
  width: "100%",
  height: "100%",

  padding: 0,
  margin: 0,
  border: "none",
  outline: "none",

  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
});

export const codeTextArea = style([
  codeBase,
  {
    resize: "none",
    outline: "none",
    "-webkit-text-fill-color": "transparent",

    position: "absolute",
    top: 0,
    left: 0,
  },
]);

export const codeHighlight = style([
  codeBase,
  {
    pointerEvents: "none",
  },
]);

export const errorLine = style({ backgroundColor: "#ffe3e3" });
