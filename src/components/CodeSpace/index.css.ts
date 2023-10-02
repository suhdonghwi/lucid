import { style } from "@vanilla-extract/css";

export const rootContainer = style({
  width: "100%",
  height: "100%",
  position: "relative",
});

export const windowsContainer = style({
  position: "absolute",

  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",

  display: "flex",
  gap: "1rem",
});
