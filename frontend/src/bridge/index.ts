import { ExecResult } from "@/schemas/ExecResult";

export interface BridgeInterface {
  execute: (code: string) => Promise<ExecResult>;
  interrupt: () => Promise<void>;
}
