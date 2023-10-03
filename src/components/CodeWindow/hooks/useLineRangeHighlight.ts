import { useMemo } from "react";

import { lineRangeHighlight } from "../extensions/lineRangeHighlight";

export function useLineRangeHighlight(startLineno: number) {
  const [
    setEvalHighlightRange,
    clearEvalHighlightRange,
    rangeHighlightExtension,
  ] = useMemo(
    () =>
      lineRangeHighlight({
        startLineno,
        highlightColor: "#fff3bf",
        id: "eval",
      }),
    [startLineno]
  );

  return {
    setEvalHighlightRange,
    clearEvalHighlightRange,
    rangeHighlightExtension,
  };
}
