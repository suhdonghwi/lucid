type Path = string;
type Content = string;

export type RepositoryFile = {
	path: Path;
	content: Content;
};

export type SerializedRepository = Map<Path, Content>;

export class Repository {
	private map: SerializedRepository;

	constructor() {
		this.map = new Map();
	}

	public setFile(file: RepositoryFile) {
		return Repository.deserialize(this.map.set(file.path, file.content));
	}

	public getContent(path: Path) {
		return this.map.get(path);
	}

	public files() {
		const result: RepositoryFile[] = [];

		for (const [path, content] of this.map.entries()) {
			result.push({ path, content });
		}

		return result;
	}

	// NOTE:
	// serialization and deserialization is required because
	// we cannot pass an object with methods to a web worker.
	public serialize(): SerializedRepository {
		return this.map;
	}

	static deserialize(serializedRepo: SerializedRepository) {
		const repo = new Repository();
		repo.map = serializedRepo;
		return repo;
	}
}
