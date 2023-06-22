export type PosRange = {
  line: number;
  end_line: number;

  col: number;
  end_col: number;
};

export type TrackData = {
  value: any;

  pos_range: PosRange;

  frame_id: number;
  code_obj_line: number;
  code_obj_end_line: number;
};
