import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";
import { useReportMutations } from "../useReportMutations";
import { useQueryParams } from "../../../hooks/useQueryParams";

import { getReport } from "../../../api/reports";
import { getSources } from "../../../api/sources";

import type { ReportQueryState, Reports, Tag } from "../../../objectTypes";

import AggieButton from "../../../components/AggieButton";
import AddReportsToIncidents from "../components/AddReportsToIncident";
import DropdownMenu from "../../../components/DropdownMenu";
import SocialMediaPost from "../../../components/SocialMediaPost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faDotCircle,
  faEnvelope,
  faEnvelopeOpen,
  faFile,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
const Report = () => {
  let { id } = useParams();
  const { setParams } = useQueryParams<ReportQueryState>();
  const navigate = useNavigate();
  const queryData = useUpdateQueryData();
  const { setRead, setIrrelevance } = useReportMutations();

  const { data: report, isLoading } = useQuery(["reports", id], () =>
    getReport(id)
  );
  const sourcesQuery = useQuery(["sources"], getSources);

  function newIncidentFromReport() {
    const params = new URLSearchParams({
      reports: [id].toString(),
    });

    navigate("/incidents/new?" + params.toString());
  }
  //mark as read
  const [ranOnce, setRanOnce] = useState("");

  useEffect(() => {
    if (!report || !id || ranOnce === id) return;

    if (!report.read) {
      setRead.mutate({ reportIds: [id], read: true, currentPageId: id });
    }

    setRanOnce(id);
  }, [report, id]);

  function getSourceFromId(ids: string[]) {
    if (!sourcesQuery.data) return <>none</>;

    const names = ids.reduce((previous, currentId) => {
      const source = sourcesQuery.data?.find((i) => i._id === currentId);
      if (!source)
        return (
          <>
            {previous}
            {previous.props.children && ", "}
            <span>Unknown Source</span>
          </>
        );
      return (
        <>
          {previous}
          {previous.props.children && ", "}
          <button
            className='inline hover:bg-slate-100 rounded hover:underline px-1 text-left'
            onClick={() => setParams({ sourceId: source._id })}
          >
            {source.nickname}
          </button>
        </>
      );
    }, <></>);
    return names;
  }

  const [addReportModal, setAddReportModal] = useState(false);
  function addReportsToIncidents() {
    setAddReportModal(true);
  }
  // refactor to be more pretty and have placeholders
  if (isLoading)
    return (
      <span className='pt-4 sticky top-0 font-medium text-center'>
        ...loading
      </span>
    );
  if (!report || !id) return <> error loading page</>;
  return (
    <article className='pt-4 pr-2 sticky top-0 overflow-y-auto max-h-[93vh]  '>
      <AddReportsToIncidents
        selection={id ? [id] : undefined}
        isOpen={addReportModal}
        queryKey={["reports"]}
        onClose={() => setAddReportModal(false)}
      />
      <nav className='pl-3 pr-2 py-2 flex justify-between items-center rounded-lg text-xs border border-slate-300 mb-2 shadow-md bg-white'>
        <div className='flex  text-xs  rounded-lg border border-slate-300 '>
          <AggieButton
            variant={report.read ? "light:lime" : "light:amber"}
            className='rounded-l-lg'
            onClick={(e) => {
              e.stopPropagation();

              setRead.mutate({
                reportIds: [report._id],
                read: !report.read,
                currentPageId: id,
              });
            }}
            loading={setRead.isLoading}
            disabled={!report || setRead.isLoading}
            icon={report.read ? faEnvelopeOpen : faEnvelope}
          >
            {report.read ? <> unread</> : <> read</>}
          </AggieButton>
          <AggieButton
            variant={
              report.irrelevant === "true" ? "light:green" : "light:rose"
            }
            className='rounded-r-lg'
            onClick={(e) => {
              e.stopPropagation();
              setIrrelevance.mutate({
                reportIds: [report._id],
                irrelevant: report.irrelevant === "true" ? "false" : "true",
                currentPageId: id,
              });
            }}
            icon={report.irrelevant === "true" ? faDotCircle : faXmark}
            loading={setIrrelevance.isLoading}
            disabled={!report || setIrrelevance.isLoading}
          >
            {report.irrelevant === "true" ? <>relevant</> : <>irrelevant</>}
          </AggieButton>
        </div>
        <div className='flex gap-1'>
          <div className='flex font-medium'>
            <AggieButton
              className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-300 hover:bg-slate-200'
              onClick={addReportsToIncidents}
            >
              <>
                <FontAwesomeIcon icon={faPlus} />
                Add to Incident
              </>
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
            >
              <AggieButton
                className='px-3 py-2 hover:bg-slate-200'
                onClick={newIncidentFromReport}
              >
                <FontAwesomeIcon icon={faFile} />
                Create New Incident with Report
              </AggieButton>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <div className='flex flex-col gap-1 my-2'>
        <div className='grid grid-cols-3'>
          <p className='font-medium text-sm py-1 px-2 '>Source</p>
          <p className='col-span-2 '>{getSourceFromId(report._sources)}</p>
        </div>
        <div className='grid grid-cols-3'>
          <p className='font-medium text-sm py-1 px-2 '>Tags</p>
          <p className='col-span-2'>Tags don't work right now</p>
        </div>
      </div>

      <SocialMediaPost report={report} showMedia />
    </article>
  );
};

export default Report;
