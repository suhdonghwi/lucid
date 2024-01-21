export type Path = string;
export type Code = string;

export type Repository<Content = Code> = Map<Path, Content>;
