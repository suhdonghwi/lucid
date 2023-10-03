import { useMemo } from "react";
import { uuidv4 } from "sync-message";

import { lineRangeHighlight } from "../extensions/lineRangeHighlight";

export function useLineRangeHighlight({
  startLineno,
  highlightColor,
}: {
  startLineno: number;
  highlightColor: string;
}) {
  const [
    setEvalHighlightRange,
    clearEvalHighlightRange,
    rangeHighlightExtension,
  ] = useMemo(
    () =>
      lineRangeHighlight({
        startLineno,
        highlightColor,
        id: uuidv4(),
      }),
    [startLineno, highlightColor]
  );

  return {
    setEvalHighlightRange,
    clearEvalHighlightRange,
    rangeHighlightExtension,
  };
}
