type SourceFile = string;
type PathName = string;

export type Directory = Map<PathName, SourceFile | Directory>;
