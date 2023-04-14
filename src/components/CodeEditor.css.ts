import { style } from "@vanilla-extract/css";

export const rootContainer = style({
  position: "relative",
  width: "30rem",
  height: "30rem",
});

const containerBase = style({
  position: "absolute",
  top: 0,
  left: 0,

  width: "100%",
  height: "100%",
});

export const codeEditorContainer = style([containerBase, {}]);

export const codeViewerContainer = style([containerBase, {}]);

export const codeViewerPre = style({ margin: 0, height: "100%" });
