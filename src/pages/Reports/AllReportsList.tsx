import {
  faCheck,
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
import { useQuery } from "@tanstack/react-query";
import { getReports } from "../../api/reports";
import AggieButton from "../../components/AggieButton";
import { useMultiSelect } from "../../hooks/useMultiSelect";
import { useQueryParams } from "../../hooks/useQueryParams";
import { ReportQueryState } from "../../types/reports";
import ReportListItem from "./ReportListItem";
import ReportsFilters from "./ReportsFilters";
import { useReportMutations } from "./useReportMutations";
import { useNavigate, useParams } from "react-router-dom";
import DropdownMenu from "../../components/DropdownMenu";
import Pagination from "../../components/Pagination";
import { formatPageCount } from "../../utils/format";
import { useEffect } from "react";

interface IProps {
  onAttachIncident: (id: string[]) => void;
  onNavigateReport: (id: string) => void;
}

const AllReportsList = ({ onAttachIncident, onNavigateReport }: IProps) => {
  const { id: currentPageId } = useParams();
  const navigate = useNavigate();
  const { setRead, setIrrelevance } = useReportMutations();

  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  useEffect(() => {
    // refetch on filter change
    reportsQuery.refetch();
  }, [searchParams]);

  const multiSelect = useMultiSelect({
    allItems: reportsQuery.data?.results,
    mapFn: (i) => i._id,
  });

  function onReportItemClick(id: string, isRead: boolean) {
    onNavigateReport(id);
    multiSelect.set([id]);
    if (!isRead)
      setRead.mutate({ reportIds: [id], read: true, currentPageId: id });
  }

  function onNewIncidentFromReports() {
    const params = new URLSearchParams({
      reports: multiSelect.selection.join(":"),
    });

    navigate({ pathname: "/incidents/new", search: params.toString() });
  }

  return (
    <>
      <div className='px-1 py-2 bg-gray-50/75 backdrop-blur-sm sticky top-0 z-10 '>
        <ReportsFilters
          reportCount={reportsQuery.data && reportsQuery.data.total}
          headerElement={
            <AggieButton
              variant='secondary'
              className='text-xs font-medium '
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
                  onClick={() => onAttachIncident(multiSelect.selection)}
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
                  <AggieButton
                    className='px-3 py-2 hover:bg-slate-200'
                    onClick={onNewIncidentFromReports}
                  >
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
        {reportsQuery.isSuccess &&
          reportsQuery.data?.results.map((report) => (
            <div
              onClick={() => onReportItemClick(report._id, report.read)}
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
      <div className='flex flex-col items-center justify-center mt-3 mb-40 w-full'>
        <div className='w-fit text-sm'>
          <Pagination
            currentPage={Number(getParam("page")) || 0}
            totalCount={reportsQuery.data?.total || 0}
            onPageChange={(num) => setParams({ page: num })}
            size={4}
          />
        </div>
        <small className={"text-center font-medium w-full mt-2"}>
          {formatPageCount(
            Number(getParam("page")),
            50,
            reportsQuery.data?.total
          )}
        </small>
      </div>
    </>
  );
};

export default AllReportsList;
