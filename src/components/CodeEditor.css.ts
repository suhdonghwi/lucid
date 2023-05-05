import { style } from "@vanilla-extract/css";

const gutterWidth = "40px";

export const rootContainer = style({
  width: "30rem",
  height: "30rem",
  fontFamily: "Fira Mono, monospace",
  fontSize: "14px",

  overflow: "auto",

  backgroundColor: "#f8f9fa",
  padding: "0.9rem 0.4rem",
  borderRadius: "10px",
});

export const editorContainer = style({
  position: "relative",
  minHeight: "100%",
});

const codeBase = style({
  width: "100%",
  height: "100%",

  padding: 0,
  margin: 0,
  border: "none",
  outline: "none",

  wordBreak: "break-all",
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
    left: gutterWidth,
    width: `calc(100% - ${gutterWidth})`,
  },
]);

export const codeHighlight = style([
  codeBase,
  {
    pointerEvents: "none",
    display: "grid",
    gridTemplateColumns: `${gutterWidth} 1fr`,
  },
]);

export const lineNumber = style({
  justifySelf: "end",
  marginRight: 12,
  color: "#adb5bd",

  wordBreak: "keep-all",
});

export const errorLine = style({ backgroundColor: "#ffe3e3" });
