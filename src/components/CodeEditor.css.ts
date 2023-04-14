import { style } from "@vanilla-extract/css";

export const rootContainer = style({
  position: "relative",
  width: "30rem",
  height: "30rem",

  fontFamily: "Ubuntu Mono, monospace",
});

const codeContainerBase = style({
  position: "absolute",
  top: 0,
  left: 0,

  width: "100%",
  height: "100%",
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

export const codeEditorContainer = style([codeContainerBase, {}]);

export const codeEditor = style([
  codeBase,
  {
    resize: "none",
    outline: "none",
  },
]);

export const codeHighlightContainer = style([
  codeContainerBase,
  {
    pointerEvents: "none",
  },
]);

export const codeHighlight = style([codeBase, {}]);
