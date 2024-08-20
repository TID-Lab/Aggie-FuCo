//change key deep inside object, and returns new object

import { hasId } from "../objectTypes";
/**
 * update a single object inside a list, immutable
 * @param list list to search
 * @param newObject update object. requires ._id
 * @returns  list
 */
export function updateOneInList<
  T extends hasId,
  A extends { [key in keyof T]?: unknown }
>(list: T[], newObject: A): T[] {
  return list.map((i) => {
    if (i._id === newObject._id) {
      console.log({ ...i, ...newObject });
      return { ...i, ...newObject };
    } else {
      return i;
    }
  });
}
