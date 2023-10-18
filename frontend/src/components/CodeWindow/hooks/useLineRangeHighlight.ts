import { useMemo } from "react";
import { uuidv4 } from "sync-message";

import { lineRangeHighlight } from "../extensions/lineRangeHighlight";

export const useLineRangeHighlight = ({
  startLineno,
  highlightColor,
}: {
  startLineno: number;
  highlightColor: string;
}) =>
  useMemo(
    () =>
      lineRangeHighlight({
        startLineno,
        highlightColor,
        id: uuidv4(),
      }),
    [startLineno, highlightColor]
  );
