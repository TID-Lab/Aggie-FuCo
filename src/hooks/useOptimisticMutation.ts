import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IUseOptimisticMutation<TMutation, TQuery> {
  mutationFn: (params: TMutation) => Promise<unknown>;
  setQueryData: (
    previousData: TQuery,
    newData: TMutation
  ) => { [key in keyof TQuery]?: TQuery[keyof TQuery] };
  queryKey: string[];
  /** refetch query after mutation response? */
  refetch?: boolean;
}

/**
 * wrapper for useQuery that mutate and then optimistically update local list in memory.
 * mainly used for incidents and reports.
 * implementation basically the one described in the tutorial: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
 * */
export function useOptimisticMutation<TMutation, TQuery>({
  mutationFn,
  setQueryData,
  queryKey,
  refetch = true,
}: IUseOptimisticMutation<TMutation, TQuery>) {
  const queryClient = useQueryClient();

  const { isLoading, isError, isIdle, isSuccess, mutate } = useMutation({
    mutationFn: mutationFn,
    onMutate: async (newData) => {
      // by the way, we aren't using newData, and simply manually injecting data from the local react state.
      // thats why we don't care about typing.
      // this is bc our mutation functions don't have a return value besides success/fail so theres nothing in the newData

      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TQuery>(queryKey);
      if (previousData) {
        // Optimistically update to the new value

        queryClient.setQueryData(queryKey, {
          ...previousData,
          ...setQueryData(previousData, newData),
        });
      }
      // Return a context with the previous and new todo
      return { previousData, newData };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, newTodo, context) => {
      if (!context) return;
      // @ts-ignore
      queryClient.setQueryData(queryKey, context.previousData);
    },
    // Always refetch after error or success:
    onSettled: (newTodo) => {
      if (!refetch) return;
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });
  return { isLoading, isError, isIdle, isSuccess, mutate };
}
