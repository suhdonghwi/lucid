import { RepositoryFile } from "@/repository";

/*
 * Location Range of a code
 *  `start` represents the starting byte index of the code
 *  `end` represents the ending byte index of the code, exclusive
 */
export type LocRange = {
  file: RepositoryFile;

  start: number;
  end: number;
};
