import { useQueryClient } from "@tanstack/react-query";

export function useUpdateQueryData() {
  const queryClient = useQueryClient();

  function set<T extends object>(
    queryKey: string[],
    updateFn: (data: T) => { [key in keyof T]?: T[keyof T] }
  ) {
    const previousData = queryClient.getQueryData<T>(queryKey);
    if (!previousData) return false;
    console.log({
      ...previousData,
      ...updateFn(previousData),
    });
    queryClient.setQueryData(["reports"], {
      ...previousData,
      ...updateFn(previousData),
    });

    return true;
  }

  return { set };
}
