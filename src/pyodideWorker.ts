import type { PyodideInterface } from "pyodide";
import type { PyBuffer, PyProxy } from "pyodide/ffi";

import type { PyodideResult } from "./PyodideHelper";

import type { RunError } from "./RunError";
import type { TrackData } from "./TrackData";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");

declare global {
  interface Window {
    loadPyodide: ({
      stdout,
    }: {
      stdout?: (msg: string) => void;
    }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}

async function initializePyodide() {
  self.pyodide = await self.loadPyodide({
    stdout: (msg) => console.log("stdout:", msg),
  });
  console.log("[worker] pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    self.pyodide.FS.writeFile(name, code);
  }

  console.log("[worker] python setup files written.");
}

const pyodideReadyPromise = initializePyodide();

function proxyConverter(proxy: PyProxy): any {
  return undefined;
}

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, code, ...context } = event.data;

  const pyResult: PyBuffer = await self.pyodide.runPythonAsync(code);

  if (pyResult.type === "RunError") {
    self.postMessage({
      type: "error",
      error: {
        message: pyResult.message,
        line: pyResult.line,
        end_line: pyResult.end_line,
        offset: pyResult.offset ?? null,
        end_offset: pyResult.end_offset ?? null,
      } as RunError,
      id,
    } as PyodideResult);
    return;
  }

  const trackDataList: PyBuffer[] = pyResult.toJs({ depth: 1 });
  const convertedTrackDataList: TrackData[] = [];

  for (const trackData of trackDataList) {
    convertedTrackDataList.push({
      value:
        trackData.value instanceof self.pyodide.ffi.PyProxy
          ? trackData.value.toJs({ default_converter: proxyConverter })
          : trackData.value,
      line: trackData.line,
      end_line: trackData.end_line,
      col: trackData.col,
      end_col: trackData.end_col,

      frame_id: trackData.frame_id,
      code_obj_line: trackData.code_obj_line,
      code_obj_end_line: trackData.code_obj_end_line,
    });
  }

  console.log(convertedTrackDataList);

  self.postMessage({
    type: "success",
    result: convertedTrackDataList,
    id,
  } as PyodideResult);
};
