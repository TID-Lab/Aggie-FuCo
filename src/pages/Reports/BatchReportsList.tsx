import {
  faMinus,
  faEnvelopeOpen,
  faEnvelope,
  faXmark,
  faDotCircle,
  faPlus,
  faCaretDown,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DropdownMenu from "../../components/DropdownMenu";
import { useNavigate, useParams } from "react-router-dom";
import { cancelBatch, getBatch, getNewBatch } from "../../api/reports";
import AggieButton from "../../components/AggieButton";
import AggieCheck from "../../components/AggieCheck";
import { useMultiSelect } from "../../hooks/useMultiSelect";
import { useQueryParams } from "../../hooks/useQueryParams";
import { Report, ReportQueryState } from "../../types/reports";
import ReportListItem from "./ReportListItem";
import { useReportMutations } from "./useReportMutations";

const BatchReportList = () => {
  const { id: currentPageId } = useParams();

  const { searchParams, getParam, setParams } =
    useQueryParams<ReportQueryState>();

  const { setRead, setIrrelevance } = useReportMutations({ key: ["batch"] });

  const navigate = useNavigate();
  const newBatch = useMutation(getNewBatch);
  const cancelCurrentBatch = useMutation(cancelBatch);

  const batchQuery = useQuery(["batch"], getBatch, {
    enabled: !!getParam("batch"),
  });
  const multiSelect = useMultiSelect({
    allItems: batchQuery.data?.results,
    mapFn: (i) => i._id,
  });

  function onActivateBatchMode() {
    newBatch.mutate(undefined, {
      onSuccess: () => {
        setParams({ batch: true });
        batchQuery.refetch();
      },
    });
  }

  function onCancelBatchMode() {
    cancelCurrentBatch.mutate(undefined, {
      onSuccess: () => {
        setParams({ batch: undefined });
        navigate({ pathname: "/reports", search: searchParams.toString() });
      },
    });
  }

  function filteredCount(reports: Report[] | undefined, type: "read" | "") {
    if (!reports) return 0;
    if (type === "read")
      return reports.filter((report) => report.read === true).length || 0;
    return 0;
  }

  function onReportClick(id: string, isRead: boolean) {
    navigate({ pathname: id, search: searchParams.toString() });
    if (!isRead)
      setRead.mutate({ reportIds: [id], read: true, currentPageId: id });
  }
  // when batch mode not activated
  if (!getParam("batch"))
    return (
      <div className='w-full px-4 py-8 rounded-lg border border-slate-300 bg-white flex flex-col items-center'>
        <p className='font-medium mb-1'>
          Temporarily individually assigns you 50 reports to look at
        </p>
        <AggieButton
          className=''
          variant='primary'
          loading={newBatch.isLoading}
          onClick={onActivateBatchMode}
        >
          Assign Me a Batch of Reports
        </AggieButton>
      </div>
    );

  return (
    <>
      <div className='py-2 sticky top-0 z-10 bg-gray-50/75 backdrop-blur-sm'>
        <div className='flex justify-between  mt-1 '>
          <AggieButton
            variant='secondary'
            className='text-xs '
            onClick={() => multiSelect.toggleActive()}
          >
            {multiSelect.isActive ? "Cancel Selection" : "Select Multiple"}
          </AggieButton>

          <div className='flex gap-1 text-xs'>
            <p className='text-sm'>
              {filteredCount(batchQuery.data?.results, "read")} read of{" "}
              {batchQuery.data?.total}
            </p>
            <AggieButton
              variant='secondary'
              loading={cancelCurrentBatch.isLoading}
              onClick={onCancelBatchMode}
            >
              Cancel Batch
            </AggieButton>
            <AggieButton
              variant='primary'
              loading={newBatch.isLoading}
              onClick={onActivateBatchMode}
            >
              Grab New Batch
            </AggieButton>
          </div>
        </div>
        <div className='px-1 flex gap-2 text-xs font-medium items-center pb-1'>
          {multiSelect.isActive && (
            <>
              <AggieCheck
                active={multiSelect.any()}
                icon={!multiSelect.all() ? faMinus : undefined}
                onClick={() =>
                  multiSelect.addRemoveAll(batchQuery.data?.results)
                }
              />
              <p>
                Mark {multiSelect.selection.length} report{"(s)"} as:
              </p>
              <div className=' rounded-lg flex overflow-hidden min-w-fit'>
                <AggieButton
                  className='py-1 px-2 hover:bg-lime-200 bg-lime-100 text-lime-800'
                  disabled={!multiSelect.any()}
                  onClick={() =>
                    setRead.mutate({
                      reportIds: multiSelect.selection,
                      read: true,
                      currentPageId,
                    })
                  }
                >
                  <FontAwesomeIcon icon={faEnvelopeOpen} />
                  Read
                </AggieButton>
                <AggieButton
                  className='py-1 px-2 hover:bg-amber-200 bg-amber-100 text-amber-800'
                  disabled={!multiSelect.any()}
                  onClick={() =>
                    setRead.mutate({
                      reportIds: multiSelect.selection,
                      read: false,
                      currentPageId,
                    })
                  }
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  Unread
                </AggieButton>
              </div>
              <AggieButton
                className='bg-rose-200 text-rose-800 border border-rose-500 border-none  px-2 py-1 rounded-lg hover:bg-rose-300'
                disabled={!multiSelect.any()}
                onClick={() =>
                  setIrrelevance.mutate({
                    reportIds: multiSelect.selection,
                    irrelevant: "true",
                    currentPageId,
                  })
                }
              >
                <FontAwesomeIcon icon={faXmark} />
                Not Relevant
              </AggieButton>
              <AggieButton
                className='bg-green-100 text-green-800 border border-green-200 border-none  px-2 py-1 rounded-lg hover:bg-green-300'
                disabled={!multiSelect.any()}
                onClick={() =>
                  setIrrelevance.mutate({
                    reportIds: multiSelect.selection,
                    irrelevant: "false",
                    currentPageId,
                  })
                }
              >
                <FontAwesomeIcon icon={faDotCircle} />
                Relevant
              </AggieButton>
              <div className='flex font-medium'>
                <AggieButton
                  className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
                  onClick={() => console.log()}
                  disabled={!multiSelect.any()}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Attach Incident
                </AggieButton>
                <DropdownMenu
                  variant='secondary'
                  buttonElement={
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className='ui-open:rotate-180'
                    />
                  }
                  className='px-2 py-1 rounded-r-lg border-y border-r'
                  panelClassName='right-0'
                  disabled={!multiSelect.any()}
                >
                  <AggieButton className='px-3 py-2 hover:bg-slate-200'>
                    <FontAwesomeIcon icon={faFile} />
                    Create New Incident with Report
                  </AggieButton>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
      <div className='flex flex-col border border-slate-200 rounded-lg overflow-hidden'>
        {batchQuery.isSuccess &&
          batchQuery.data?.results.map((report) => (
            <div
              onClick={() => onReportClick(report._id, report.read)}
              className='cursor-pointer group focus-theme'
              key={report._id}
              tabIndex={0}
              role='button'
            >
              <ReportListItem
                report={report}
                isChecked={multiSelect.exists(report._id)}
                isSelectMode={multiSelect.isActive}
                onCheckChange={() => multiSelect.addRemove(report._id)}
              />
            </div>
          ))}
      </div>
      <div className='flex gap-1 justify-center w-full mt-3 mb-8'>
        <AggieButton
          className='text-sm'
          variant='secondary'
          loading={cancelCurrentBatch.isLoading}
          onClick={onCancelBatchMode}
        >
          Cancel Batch
        </AggieButton>
        <AggieButton
          className='text-sm'
          variant='primary'
          loading={newBatch.isLoading}
          onClick={onActivateBatchMode}
        >
          Grab New Batch
        </AggieButton>
      </div>
    </>
  );
};

export default BatchReportList;
