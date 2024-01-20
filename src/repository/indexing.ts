import { Path, Code, Repository } from ".";

type IndexedRepository = { path: Path; code: Code }[];

export function indexRepository(repository: Repository): IndexedRepository {
  const indexedRepository: IndexedRepository = [];

  for (const [path, code] of repository.entries()) {
    indexedRepository.push({ path, code });
  }

  return indexedRepository;
}
