import { useMemo } from "react";

import { getBasicExtensions } from "../extensions";

export function useBasicExtensions(startLineno: number) {
  return useMemo(() => getBasicExtensions({ startLineno }), [startLineno]);
}
