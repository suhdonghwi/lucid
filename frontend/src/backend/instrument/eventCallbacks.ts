import identifiers from "./identifiers";

export const result: number[] = [];

export default {
  [identifiers.events.functionEnter]() {
    result.push(1);
    console.log("enter");
  },
  [identifiers.events.functionLeave]() {
    result.push(2);
    console.log("leave");
  },
};
