import { useRef, useEffect } from "react";

import { githubLightInit } from "@uiw/codemirror-theme-github";

import { useCodeMirror } from "./useCodeMirror";
import { basicExtensions } from "./extensions";
import * as cls from "./index.css";

const theme = githubLightInit({
	theme: "light",
	settings: {
		background: "white",
		gutterBackground: "transparent",
		fontFamily: "JetBrains Mono, monospace",
	},
});

type CodeWindowProps = {
	code: string;
	onCodeChange?: (code: string) => void;
};

export function CodeWindow({ code, onCodeChange }: CodeWindowProps) {
	const editorDiv = useRef<HTMLDivElement | null>(null);

	const { setContainer } = useCodeMirror({
		// NOTE: View dispatch does not occur if the value is same with view's internal state
		value: code,
		extensions: [...basicExtensions, theme],
		onChange: onCodeChange,
	});

	useEffect(() => {
		if (editorDiv.current) setContainer(editorDiv.current);
	}, [setContainer]);

	return <div className={cls.rootContainer} ref={editorDiv} />;
}
