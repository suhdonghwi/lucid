import { useMemo } from "react";

import { getBasicExtensions } from "../extensions";

export function useBasicExtensions() {
  return useMemo(() => getBasicExtensions(), []);
}
