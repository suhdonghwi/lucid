export type RunError = {
  message: string;

  line: number;
  end_line: number;

  offset: number;
  end_offset: number;
};
