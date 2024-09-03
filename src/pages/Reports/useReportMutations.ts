import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { IrrelevanceOptions } from "../../api/common";
import { setSelectedRead, setSelectedIrrelevance } from "../../api/reports";

import { useOptimisticMutation } from "../../hooks/useOptimisticMutation";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";
import { useQueryParams } from "../../hooks/useQueryParams";

import { updateByIds } from "../../utils/immutable";

import type {
  Reports,
  Report,
  ReportQueryState,
} from "../../api/reports/types";

const defaultOptions = {
  key: ["reports"],
};

export const useReportMutations = (
  options: typeof defaultOptions = defaultOptions
) => {
  const queryData = useUpdateQueryData();
  const navigate = useNavigate();
  const { searchParams } = useQueryParams<ReportQueryState>();

  // this is an exmaple of optimistic mutation

  const setRead = useMutation({
    mutationFn: (params: {
      reportIds: string[];
      read: boolean;
      currentPageId?: string;
    }) => setSelectedRead(params.reportIds, params.read),
    onMutate: (params) => {
      // update reports list
      queryData.queryClient.cancelQueries(options.key);
      const contextReports = queryData.update<Reports>(options.key, (data) => {
        const updateData = updateByIds(params.reportIds, data.results, {
          read: params.read,
        });
        return {
          results: updateData,
        };
      });
      let contextReport;
      // update single report
      if (params.currentPageId) {
        contextReport = queryData.update<Report>(
          ["report", params.currentPageId],
          (data) => {
            return {
              read: params.read,
            };
          }
        );
      }
      // pass context down
      return {
        reports: contextReports?.previousData,
        report: contextReport?.previousData,
        reportId: params.currentPageId,
      };
    },
    onError: (errors, params, context) => {
      if (!context) return;
      // if mutation fails, revert
      //@ts-ignore this is fixed in typescript 5 but we cant update it bc were using react-scripts soooooo
      queryData.queryClient.setQueryData(options.key, context.reports);
      if (context.reportId && context.report)
        queryData.queryClient.setQueryData(
          ["report", context.reportId],
          context.report
        );
    },
  });

  const setIrrelevance = useMutation({
    mutationFn: (params: {
      reportIds: string[];
      irrelevant: IrrelevanceOptions;
      currentPageId?: string;
    }) => setSelectedIrrelevance(params.reportIds, params.irrelevant),
    onSuccess: (_, params) => {
      // update reports list
      queryData.update<Reports>(options.key, (previousData) => {
        const updateData = updateByIds(params.reportIds, previousData.results, {
          irrelevant: params.irrelevant,
        });
        return {
          results: updateData,
        };
      });
      // update single report
      if (params.currentPageId) {
        queryData.update<Report>(["report", params.currentPageId], (data) => {
          return {
            irrelevant: params.irrelevant,
          };
        });
        navigate({ pathname: "/reports", search: searchParams.toString() });
      }
    },
  });
  return {
    setRead,
    setIrrelevance,
  };
};
