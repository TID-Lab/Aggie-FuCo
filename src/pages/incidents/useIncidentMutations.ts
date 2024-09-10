import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";
import { useQueryParams } from "../../hooks/useQueryParams";

import { updateByIds } from "../../utils/immutable";
import type { ReportQueryState } from "../../api/reports/types";
import { editGroup, deleteGroup } from "../../api/groups";
import { useOptimisticMutation } from "../../hooks/useOptimisticMutation";
import type { Groups } from "../../api/groups/types";

const defaultOptions = {
  key: ["reports"],
};

export const useReportMutations = (
  options: typeof defaultOptions = defaultOptions
) => {
  const queryData = useUpdateQueryData();
  const navigate = useNavigate();
  const { searchParams } = useQueryParams<ReportQueryState>();

  const update = useMutation({
    mutationFn: editGroup,
    onSuccess: (_, variables) => {
      queryData.update<Groups>(["groups"], (data) => {
        if (!variables._id) return {};
        return {
          results: updateByIds([variables._id], data.results, {
            ...variables,
          }),
        };
      });
    },
    onSettled: (newTodo) => {
      queryData.queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_, variables) => {
      queryData.update<Groups>(["groups"], (data) => {
        return {
          results: data.results.filter((i) => i._id !== variables._id),
        };
      });
    },
    onSettled: (newTodo) => {
      queryData.queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
  return { update, remove };
};
