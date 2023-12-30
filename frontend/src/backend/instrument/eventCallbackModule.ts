import events from "./events";

export const result: number[] = [];

export default {
  [events.FUNCTION_ENTER]: () => {
    result.push(1);
    console.log("enter");
  },
  [events.FUNCTION_LEAVE]: () => {
    console.log("leave");
  },
};
