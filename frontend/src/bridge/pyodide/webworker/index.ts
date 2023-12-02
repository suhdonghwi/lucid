import * as Comlink from "comlink";
import { syncExpose } from "comsync";

import { pyodidePromise } from "./initialize";

import { execErrorSchema } from "@/schemas/ExecError";
import { ExecResult } from "@/schemas/ExecResult";

const api = {
  execute: syncExpose(
    async (
      _syncExtras,
      interruptBuffer: Uint8Array,
      code: string,
    ): Promise<ExecResult> => {
      const pyodide = await pyodidePromise;
      pyodide.setInterruptBuffer(interruptBuffer);

      pyodide.FS.writeFile("hello.py", `print("this is from hello")`, {
        encoding: "utf8",
      });

      const pyodideBackend = pyodide.pyimport("lucid_backend_pyodide");
      const pythonResult = pyodideBackend.execute(code, "main.py");

      pyodide.runPython("import sys; del sys.modules['hello']");

      if (pythonResult !== undefined) {
        const execError = execErrorSchema.parse(pythonResult);
        return { type: "error", error: execError };
      }

      return { type: "success" };
    },
  ),
};

export type PyodideWorkerAPI = typeof api;
Comlink.expose(api);
