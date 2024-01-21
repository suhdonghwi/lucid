import * as acorn from "acorn";
import { generate } from "astring";

import { Repository } from "@/repository";

import { EventCallbacks, IndexedAST, instrument } from "../instrument";

const EVENT_CALLBACKS_IDENTIFIER = "evc";

type GlobalThisWithEventCallbacks = typeof globalThis & {
  [EVENT_CALLBACKS_IDENTIFIER]?: EventCallbacks;
};

const globalThisWithEventCallbacks = globalThis as GlobalThisWithEventCallbacks;

function createCodeBlob(input: string) {
  return new Blob([input], { type: "text/javascript" });
}

function parseRepository(repo: Repository) {
  const parsedRepo: Repository<acorn.Program> = new Map();

  for (const [path, code] of repo.entries()) {
    parsedRepo.set(path, acorn.parse(code, { ecmaVersion: "latest" }));
  }

  return parsedRepo;
}

export type IndexedRepository = { path: string; indexedAST: IndexedAST }[];

function instrumentRepository(parsedRepo: Repository<acorn.Program>) {
  const indexedRepo: IndexedRepository = [];
  const instrumentedRepo: Repository<acorn.Program> = new Map();

  for (const [path, parsedCode] of parsedRepo.entries()) {
    const { result: instrumentedAST, indexedAST } = instrument(parsedCode, {
      sourceIndex: indexedRepo.length,
      eventCallbacksIdentifier: EVENT_CALLBACKS_IDENTIFIER,
    });

    indexedRepo.push({ path, indexedAST });
    instrumentedRepo.set(path, instrumentedAST);
  }

  return { result: instrumentedRepo, indexedRepo };
}

export async function execute(
  repo: Repository,
  createEventCallbacks: (indexedRepo: IndexedRepository) => EventCallbacks,
) {
  const parsedRepo = parseRepository(repo);
  const { result: instrumentedRepo, indexedRepo } =
    instrumentRepository(parsedRepo);

  const entryAST = instrumentedRepo.get("index.js");
  if (entryAST === undefined) {
    throw new Error("Entry file not found");
  }

  const instrumentedCode = generate(entryAST);
  console.log("instrumented code:\n", instrumentedCode);

  globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER] =
    createEventCallbacks(indexedRepo);

  const codeBlob = createCodeBlob(instrumentedCode);
  const objectURL = URL.createObjectURL(codeBlob);
  await import(
    /* @vite-ignore */
    objectURL
  );
  URL.revokeObjectURL(objectURL);

  delete globalThisWithEventCallbacks[EVENT_CALLBACKS_IDENTIFIER];
}
