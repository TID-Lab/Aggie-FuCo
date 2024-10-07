import { useMutation } from "@tanstack/react-query";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";

import { updateByIds } from "../../utils/immutable";
import {
  editGroup,
  deleteGroup,
  setSelectedClosed,
  setSelectedEscalated,
} from "../../api/groups";
import type { Groups } from "../../api/groups/types";

const defaultOptions = {
  key: ["groups"],
};

export const useIncidentMutations = (
  options: typeof defaultOptions = defaultOptions
) => {
  const queryData = useUpdateQueryData();

  const doUpdate = useMutation({
    mutationFn: editGroup,
    onSuccess: (_, variables) => {
      queryData.update<Groups>(options.key, (data) => {
        if (!variables._id) return {};
        return {
          results: updateByIds([variables._id], data.results, {
            ...variables,
          }),
        };
      });
    },
    onSettled: (data) => {
      queryData.queryClient.invalidateQueries({ queryKey: options.key });
    },
  });

  const doRemove = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_, variables) => {
      queryData.update<Groups>(options.key, (data) => {
        return {
          results: data.results.filter((i) => i._id !== variables._id),
        };
      });
    },
    onSettled: (data) => {
      queryData.queryClient.invalidateQueries({ queryKey: options.key });
    },
  });

  const doSetClosed = useMutation({
    mutationFn: setSelectedClosed,
    onSuccess: (_, params) => {
      queryData.update<Groups>(options.key, (data) => {
        const updateData = updateByIds(params.ids, data.results, {
          closed: params.closed,
        });
        return {
          results: updateData,
        };
      });
    },
  });

  const doSetEscalate = useMutation({
    mutationFn: setSelectedEscalated,
    onSuccess: (_, params) => {
      queryData.update<Groups>(options.key, (data) => {
        const updateData = updateByIds(params.ids, data.results, {
          escalated: params.escalated,
        });
        return {
          results: updateData,
        };
      });
    },
  });
  return { doUpdate, doRemove, doSetClosed, doSetEscalate };
};
