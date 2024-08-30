import { useQuery } from "@tanstack/react-query";
import { getBatch } from "../../api/reports";

const BatchReportList = () => {
  const batchMode = false;

  const batchQuery = useQuery(["batch"], getBatch, {
    enabled: batchMode,
    onSuccess: (data) => {
      if (data && data.total === 0) {
        // If this is true either we have no reports left, or the user has not checked out a batch
        //newBatchMutation.mutate();
      }
    },
  });

  return <>blah</>;
};

export default BatchReportList;
