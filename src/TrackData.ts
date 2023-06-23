export type PosRange = {
  line: number;
  endLine: number;

  col: number;
  endCol: number;
};

export type TrackData = {
  value: any;

  posRange: PosRange;

  frameId: number;
  codeObjLine: number;
  codeObjEndLine: number;
};
