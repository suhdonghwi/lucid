export type Path = string;
export type Code = string;

export type Repository = Map<Path, Code>;

export { indexRepository } from "./indexing";
