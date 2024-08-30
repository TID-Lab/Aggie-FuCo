import { useState } from "react";
import { isEqual } from "lodash";

interface IOptions<T> {
  /** list of data that we want to select. can by any type.*/
  allItems?: T[];
  /** tells function how to grab a unique id string from each data object. must return a string
   * for example, if data object contains an id field use:
   *
   * (item) => item.id
   */
  mapFn: (item: T) => string;
  /** initial selection */
  initial?: string[];
}

/**
 *
 *  wrapper for "select multiple" functionality
 *  keeps track of a string array that keeps id's of the selected object
 *
 * @param options required options
 * @returns
 */
export function useMultiSelect<T>({ allItems, mapFn, initial }: IOptions<T>) {
  const [selection, setSelection] = useState<string[]>(initial || []);
  const [isActive, setIsActive] = useState(false);

  /**utility to compare if items in list are equal. if no allItems list is provided, do a simple length comparison */
  function compareSelection(data: T[]) {
    if (!allItems) return selection.length === data.length;

    const allItemIds = allItems.map(mapFn);
    return isEqual(allItemIds, selection);
  }

  /**  if id exists, remove. otherwise add to list */
  function addRemove(id: string) {
    if (selection.includes(id)) {
      const newSelection = selection.filter((i) => i !== id);
      setSelection(newSelection || []);
    } else {
      setSelection([...selection, id]);
    }
  }

  /** given list of data, toggle selection. if list is different, then set selection */
  function addRemoveAll(data: T[] | undefined) {
    // this function might have performance issues. if there is, lets refactor the compare to not do all that
    if (!data) return;
    if (data.length === 0 || compareSelection(data)) {
      setSelection([]);
    } else {
      setSelection(data.map(mapFn));
    }
  }
  /** toggles select multiple mode and clears selection */
  function toggleActive() {
    if (isActive) {
      setSelection([]);
      setIsActive(false);
    } else setIsActive(true);
  }

  // utility

  /** returns true if anything is selected */
  function any() {
    return selection.length > 0;
  }

  /** returns true if everything is selected, assuming everything is defined the inital list */
  function all() {
    if (!allItems) return undefined;
    return selection.length === allItems.length;
  }
  /** returns true if id exists in selection */
  function exists(id: string) {
    return selection.includes(id);
  }
  return {
    isActive,
    toggleActive,
    selection,
    addRemoveAll,
    addRemove,
    any,
    all,
    exists,
    setActive: setIsActive,
    set: setSelection,
  };
}

export type IuseMultiSelect = typeof useMultiSelect;
