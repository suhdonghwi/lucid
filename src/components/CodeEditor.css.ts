import { style } from "@vanilla-extract/css";

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
