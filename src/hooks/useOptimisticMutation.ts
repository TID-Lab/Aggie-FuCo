/***
 * im depcreating this even though i just wrote it.
 * i think i approached it the wrong way
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IUseOptimisticMutation<TMutation, TQuery> {
  mutationFn: (params: TMutation) => Promise<unknown>;
  onMutate?: (params: TMutation) => void;
  setQueryData?: (
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
  onMutate,
  queryKey,
  refetch = true,
}: IUseOptimisticMutation<TMutation, TQuery>) {
  const queryClient = useQueryClient();

  const { isLoading, isError, isIdle, isSuccess, mutate } = useMutation({
    mutationFn: mutationFn,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      onMutate && onMutate(newData);
      // Snapshot the previous value
      if (setQueryData) {
        const previousData = queryClient.getQueryData<TQuery>(queryKey);
        if (previousData) {
          // Optimistically update to the new value

          queryClient.setQueryData(queryKey, {
            ...previousData,
            ...setQueryData(previousData, newData),
          });
        }
      }
      const previousData = queryClient.getQueryData<TQuery>(queryKey);

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

export type IuseOptimisticMutation = typeof useOptimisticMutation;
