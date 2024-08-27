import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Link, useOutlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useQueryParams } from "../../hooks/useQueryParams";
import type {
  Report,
  ReportQueryState,
  Reports as ReportsType,
} from "../../objectTypes";
import { getReports, setSelectedRead } from "../../api/reports";

import ReportsFilters from "./ReportsFilters";
import ReportListItem from "./ReportListItem";
import { Formik, Field } from "formik";

import { Form } from "react-bootstrap";
import AggieButton from "../../components/AggieButton";
import AggiePagination from "../../components/AggiePagination";
import {
  faCaretDown,
  faCheck,
  faEnvelope,
  faEnvelopeOpen,
  faFile,
  faMinus,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOptimisticMutation } from "../../hooks/useOptimisticMutation";
import { updateOneInList } from "../../utils/immutable";
import { Menu } from "@headlessui/react";
import AddReportsToIncidents from "./AddReportsToIncident";
import Pagination from "../../components/Pagination";
import { formatNumber } from "../../utils/format";
import { useMultiSelect } from "../../hooks/useMultiSelect";

const Reports = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const queryClient = useQueryClient();
  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  const multiSelect = useMultiSelect({
    allItems: reportsQuery.data?.results,
    mapFn: (i) => i._id,
  });

  useEffect(() => {
    // refetch on filter change
    reportsQuery.refetch();
  }, [searchParams]);

  const setMultipleReadMutation = useOptimisticMutation({
    queryKey: ["reports"],
    mutationFn: (params: { reportIds: string[]; read: boolean }) =>
      setSelectedRead(params.reportIds, params.read),
    setQueryData: (previousData: ReportsType, newData) => {
      return {
        ...previousData,
        results: previousData.results.map((i) => {
          if (newData.reportIds.includes(i._id)) {
            return { ...i, read: newData.read };
          }
          return i;
        }),
      };
    },
  });

  function showReportCount(
    page: number,
    pageSize: number,
    total: number | undefined
  ) {
    const totalCount = total !== undefined ? formatNumber(total) : "---";

    const pageCount = page * pageSize;

    const toCount = pageCount + 51 > (total || 0) ? total || 0 : pageCount + 51;

    return `${formatNumber(pageCount + 1)} — ${formatNumber(
      toCount
    )} of ${totalCount}`;
  }

  const setSingleReadMutation = useMutation({
    mutationFn: (params: { reportId: string; read: boolean }) =>
      setSelectedRead([params.reportId], params.read),
    onSuccess: (newData, variables) => {
      const previousData = queryClient.getQueryData<ReportsType>(["reports"]);
      if (previousData) {
        queryClient.setQueryData(["reports"], {
          ...previousData,
          results: updateOneInList(previousData.results, {
            _id: variables.reportId,
            read: variables.read,
          }),
        });
      }
      const singleReport = queryClient.getQueryData<Report>([
        "report",
        variables.reportId,
      ]);
      if (singleReport) {
        queryClient.setQueryData(["report", variables.reportId], {
          ...singleReport,
          read: variables.read,
        });
      }
    },
  });

  function onReportItemClick(id: string, isRead: boolean) {
    navigate(id + "?" + searchParams.toString());
    multiSelect.set([id]);
    if (!isRead) setSingleReadMutation.mutate({ reportId: id, read: true });
  }
  function onNewIncidentFromReports() {
    const params = new URLSearchParams({
      reports: multiSelect.selection.join(":"),
    });

    navigate("/incidents/new?" + params.toString());
  }

  const [addReportModal, setAddReportModal] = useState(false);
  function addReportsToIncidents() {
    setAddReportModal(true);
  }

  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-3'>
      <AddReportsToIncidents
        reports={reportsQuery.data?.results.filter((i) =>
          multiSelect.exists(i._id)
        )}
        isOpen={addReportModal}
        onClose={() => setAddReportModal(false)}
      />
      <main className='col-span-2 '>
        <header className='my-4 col-span-3 flex justify-between'>
          <h1 className='text-3xl font-medium '>
            All Reports <span className='text-slate-400'>Batch Mode</span>
          </h1>
          <p className='font-medium text-sm'>
            {showReportCount(
              Number(getParam("page")) || 0,
              50,
              reportsQuery.data?.total
            )}
          </p>
        </header>

        <div className='px-1 py-2 bg-gray-50/75 backdrop-blur-sm sticky top-0 z-10 '>
          <ReportsFilters
            reportCount={reportsQuery.data && reportsQuery.data.total}
            headerElement={
              <AggieButton
                className='text-xs font-medium  bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-200'
                onClick={() => multiSelect.toggleActive()}
              >
                {multiSelect.isActive ? "Cancel Selection" : "Select Multiple"}
              </AggieButton>
            }
          />
          <div className='flex justify-between items-center'></div>
          <div className='px-1 flex gap-2 text-xs font-medium items-center'>
            {multiSelect.isActive && (
              <>
                <div
                  className='pointer-events-auto cursor-pointer group -m-2 hover:bg-blue-300/25 rounded-lg p-2 '
                  onClick={() =>
                    multiSelect.addRemoveAll(reportsQuery.data?.results)
                  }
                >
                  <div
                    className={`w-4 h-4  border border-slate-400 group-hover:border-slate-600 grid place-items-center rounded ${
                      multiSelect.any() ? "bg-blue-500 text-slate-50" : ""
                    }`}
                  >
                    {multiSelect.any() && (
                      <FontAwesomeIcon
                        icon={multiSelect.all() ? faCheck : faMinus}
                        size='xs'
                      />
                    )}
                  </div>
                </div>
                <p>
                  Mark {multiSelect.selection.length} report{"(s)"} as:
                </p>
                <div className=' rounded-lg flex overflow-hidden min-w-fit'>
                  <AggieButton
                    className='py-1 px-2 hover:bg-lime-200 bg-lime-100 text-lime-800'
                    disabled={!multiSelect.any()}
                    onClick={() =>
                      setMultipleReadMutation.mutate({
                        reportIds: multiSelect.selection,
                        read: true,
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
                      setMultipleReadMutation.mutate({
                        reportIds: multiSelect.selection,
                        read: false,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Unread
                  </AggieButton>
                </div>
                <AggieButton
                  className='bg-rose-200 text-rose-800 border border-rose-500 border-none  px-2 py-1 rounded-lg hover:bg-rose-300'
                  disabled={true}
                >
                  <FontAwesomeIcon icon={faXmark} />
                  Not Relevant
                </AggieButton>
                <div className='flex font-medium'>
                  <AggieButton
                    className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
                    onClick={addReportsToIncidents}
                    disabled={!multiSelect.any()}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Attach Incident
                  </AggieButton>
                  <Menu as='div' className='relative'>
                    <Menu.Button
                      className='px-2 py-1 rounded-r-lg bg-slate-100 border-y border-r border-slate-200 hover:bg-slate-200 ui-open:bg-slate-300 disabled:opacity-70 disabled:pointer-events-none'
                      disabled={!multiSelect.any()}
                    >
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className='ui-open:rotate-180'
                      />
                    </Menu.Button>
                    <Menu.Items className='absolute top-full right-0 mt-1 shadow-md rounded-lg bg-white border border-slate-200'>
                      <Menu.Item>
                        {({ active }) => (
                          <AggieButton
                            className='px-3 py-2   hover:bg-slate-200'
                            onClick={onNewIncidentFromReports}
                          >
                            <FontAwesomeIcon icon={faFile} />
                            Create New Incident with Report
                          </AggieButton>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex flex-col border border-slate-200 rounded-lg overflow-hidden'>
          {reportsQuery.isSuccess &&
            reportsQuery.data?.results.map((report) => (
              <div
                onClick={() => onReportItemClick(report._id, report.read)}
                className='cursor-pointer group'
                key={report._id}
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
        <div className='flex flex-col items-center justify-center mt-1 mb-40 w-full'>
          <small className={"text-center font-medium w-full mb-1"}>
            {showReportCount(
              Number(getParam("page")) || 0,
              50,
              reportsQuery.data?.total
            )}
          </small>

          <div className='w-fit'>
            <Pagination
              currentPage={Number(getParam("page")) || 0}
              totalCount={reportsQuery.data?.total || 0}
              onPageChange={(num) => setParams({ page: num })}
              size={4}
            />
          </div>
        </div>
      </main>
      <aside className='col-span-1'>
        {!outlet || !outlet.type ? (
          <p className='grid w-full py-24 place-items-center font-medium sticky top-2 bg-slate-50 rounded-lg mt-4'>
            Select a report to view in this window
          </p>
        ) : (
          outlet
        )}
      </aside>
    </section>
  );
};

export default Reports;
