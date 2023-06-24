export type EvalRange = {
  line: number;
  endLine: number;

  col: number;
  endCol: number;
};

export type TrackData = {
  value: any;

  evalRange: EvalRange;

  frameId: number;
  codeObjLine: number;
  codeObjEndLine: number;
};
