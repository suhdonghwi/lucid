import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";

import * as Comlink from "comlink";
import { syncExpose } from "comsync";

async function initializePyodide(): Promise<PyodideInterface> {
  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";
  const pyodide = await loadPyodide({ indexURL });
  pyodide.registerComlink(Comlink);

  console.log("[worker] pyodide load complete.");

  for (const { name, code } of PYTHON_SETUP_FILES) {
    pyodide.FS.writeFile(name, code);
  }

  console.log("[worker] python setup files written.");
  return pyodide;
}

const pyodidePromise = initializePyodide();

const api = {
  runPython: syncExpose(async (syncExtras, code: string) => {
    const pyodide = await pyodidePromise;

    syncExtras.readMessage();
    const runnerCode = `from runner import run\nrun(${JSON.stringify(code)})`;
    const result = await pyodide.runPython(runnerCode);
    return result;
  }),
};

Comlink.expose(api);
export type PyodideWorkerAPI = typeof api;

//
// function proxyConverter(proxy: PyProxy): any {
//   return undefined;
// }
//
// self.onmessage = async (event) => {
//   await pyodideReadyPromise;
//   const { id, code, ...context } = event.data;
//
//   const pyResult: PyBuffer = await self.pyodide.runPythonAsync(code);
//
//   if (pyResult.type === "RunError") {
//     self.postMessage({
//       type: "error",
//       error: {
//         message: pyResult.message,
//         range: {
//           line: pyResult.line,
//           endLine: pyResult.end_line,
//           col: pyResult.col ?? null,
//           endCol: pyResult.end_col ?? null,
//         },
//       } as RunError,
//       id,
//     } as PyodideResult);
//     return;
//   }
//
//   const trackDataList: PyBuffer[] = pyResult.toJs({ depth: 1 });
//   const convertedTrackDataList: TrackData[] = [];
//
//   for (const trackData of trackDataList) {
//     convertedTrackDataList.push({
//       value:
//         trackData.value instanceof self.pyodide.ffi.PyProxy
//           ? trackData.value.toJs({ default_converter: proxyConverter })
//           : trackData.value,
//       evalRange: {
//         line: trackData.line,
//         endLine: trackData.end_line,
//         col: trackData.col,
//         endCol: trackData.end_col,
//       },
//
//       frameId: trackData.frame_id,
//       codeObjLine: trackData.code_obj_line,
//       codeObjEndLine: trackData.code_obj_end_line,
//     });
//   }
//
//   console.log(convertedTrackDataList);
//
//   self.postMessage({
//     type: "success",
//     data: convertedTrackDataList,
//     id,
//   } as PyodideResult);
// };
