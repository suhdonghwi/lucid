import { initializeSyncClient } from "./sync-client";

import { BridgeInterface } from "@/bridge";

const clientPromise = initializeSyncClient();

const bridge: BridgeInterface = {
  execute: async (code: string) => {
    const client = await clientPromise;

    let interruptBuffer: Uint8Array | undefined = undefined;
    if (client.channel?.type === "atomics") {
      interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

      client.interrupter = () => {
        if (interruptBuffer !== undefined) {
          interruptBuffer[0] = 2;
        }
      };
    }

    return client.call(client.workerProxy.execute, interruptBuffer, code);
  },

  interrupt: async () => {
    const client = await clientPromise;
    await client.interrupt();
  },
};

export default bridge;
