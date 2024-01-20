type SourceFile = string;

type Entry = SourceFile | Directory;
type EntryName = string;

export type Directory = Map<EntryName, Entry>;
