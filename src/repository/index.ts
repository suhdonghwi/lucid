export type Path = string;
export type Content = string;

export type SerializedRepository = Map<Path, Content>;

export class Repository {
  private map: Map<Path, Content>;

  constructor() {
    this.map = new Map();
  }

  public set(path: Path, content: Content) {
    this.map.set(path, content);
  }

  public get(path: Path) {
    return this.map.get(path);
  }

  public entries() {
    return this.map.entries();
  }

  public serialize(): SerializedRepository {
    return this.map;
  }

  static deserialize(serializedRepo: SerializedRepository) {
    const repo = new Repository();
    repo.map = serializedRepo;
    return repo;
  }
}
