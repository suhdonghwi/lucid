export type RunError = {
  message: string;

  line: number;
  end_line: number;

  offset: number | null;
  end_offset: number | null;
};
