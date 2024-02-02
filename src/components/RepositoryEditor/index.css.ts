import { style } from "@vanilla-extract/css";

export const rootContainer = style({
	width: "100%",
	height: "100%",
});

export const buttonContainer = style({
	position: "absolute",
	zIndex: 1,
});

export const windowContainer = style({
	width: "100%",
	height: "100%",

	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});
