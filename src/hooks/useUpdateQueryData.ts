import { useQueryClient } from "@tanstack/react-query";

export function useUpdateQueryData() {
  const queryClient = useQueryClient();

  /**
   * updates local query data
   * @param queryKey tanstack-query querykey
   * @param updateFn callback that returns the new data
   * @returns pass reference to old and new data objects
   */
  function update<T extends object>(
    queryKey: string[],
    updateFn: (data: T) => { [key in keyof T]?: T[keyof T] }
  ) {
    const previousData = queryClient.getQueryData<T>(queryKey);
    if (!previousData) return undefined;
    const newData = {
      ...previousData,
      ...updateFn(previousData),
    };
    queryClient.setQueryData(queryKey, newData);

    return { previousData, newData };
  }

  return { queryClient, update };
}

export type IuseUpdateQueryData = typeof useUpdateQueryData;
