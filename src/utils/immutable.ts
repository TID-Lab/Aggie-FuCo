//change key deep inside object, and returns new object

import { hasId } from "../api/common";

// todo: refactor to accept multiple ids. could be generic to accept any parameter...?
// /**
//  * update a single object inside a list, immutable
//  * @param list list to search
//  * @param newObject update object. requires ._id
//  * @returns  list
//  */
// export function updateOneInList<
//   T extends hasId,
//   A extends { [key in keyof T]?: T[keyof T] }
// >(list: T[], newObject: A): T[] {
//   if (!newObject._id) throw "no ._id defined";
//   return list.map((i) => {
//     if (i._id === newObject._id) {
//       return { ...i, ...newObject };
//     } else {
//       return i;
//     }
//   });
// }
/**
 * update multiple objects with same information
 * @param keys list of _ids
 * @param list array of objects to search
 * @param newObject new data to put into objects
 * @returns
 */
export function updateByIds<
  T extends hasId,
  A extends { [key in keyof T]?: T[keyof T] }
>(keys: string[], list: T[], newObject: A) {
  if (!newObject)
    throw "undefined object, unable to update list by id at function updateByIds";
  return list.map((i) => {
    if (keys.includes(i._id)) {
      return { ...i, ...newObject };
    } else {
      return i;
    }
  });
}
