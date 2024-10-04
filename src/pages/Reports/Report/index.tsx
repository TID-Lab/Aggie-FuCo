import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";
import { useReportMutations } from "../useReportMutations";
import { useQueryParams } from "../../../hooks/useQueryParams";

import { getReport, setSelectedTags } from "../../../api/reports";
import { getSources } from "../../../api/sources";
import { getTags } from "../../../api/tags";
import { AxiosError } from "axios";
import type { ReportQueryState, Reports, Tag } from "../../../objectTypes";

import AggieButton from "../../../components/AggieButton";
import AddReportsToIncidents from "../components/AddReportsToIncident";
import DropdownMenu from "../../../components/DropdownMenu";
import SocialMediaPost from "../../../components/SocialMediaPost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faFile, faPlus } from "@fortawesome/free-solid-svg-icons";
import GeneratedTagsList from "../../../components/GeneratedTagsList";
const Report = () => {
  let { id } = useParams();
  const { setParams } = useQueryParams<ReportQueryState>();
  const navigate = useNavigate();
  const queryData = useUpdateQueryData();
  const { setRead, setIrrelevance } = useReportMutations();

  const reportQuery = useQuery(["report", id], () => getReport(id));
  const sourcesQuery = useQuery(["sources"], getSources);

  function newIncidentFromReport() {
    const params = new URLSearchParams({
      reports: [id].toString(),
    });

    navigate("/incidents/new?" + params.toString());
  }
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

  const [tags, setTags] = useState<Tag[] | []>([]);
  const tagsQuery = useQuery(["tags"], getTags, {
    enabled: !!reportQuery.data,
  });
  const tagsUpdateMutation = useMutation(
    (tagsUpdateInfo: { reportId: string; tags: Tag[] }) => {
      return setSelectedTags([tagsUpdateInfo.reportId], tagsUpdateInfo.tags);
    },
    {
      onSuccess: (data) => {
        // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
        reportQuery.refetch();
        queryData.update<Reports>(["reports"], (data) => {
          return {
            results: data?.results.map((i) =>
              i._id === reportQuery.data?._id
                ? { ...i, smtcTags: tags.map((tag) => tag._id) }
                : i
            ),
          };
        });
      },
      onError: (error: AxiosError) => {
        if (
          error &&
          error.response &&
          error.response.status &&
          error.response.data
        ) {
          // setShowAlert(false);
          // setAlertMessage({
          //   header: "Failed to update tags (" + error.response.status + ")",
          //   //@ts-ignore
          //   body: error.response.data,
          // });
          // setShowAlert(true);
        } else {
          console.error("Uncaught tags update error.");
        }
      },
    }
  );

  // lol
  const emptyTag: Tag = {
    isCommentTag: false,
    name: "",
    color: "",
    description: "",
    user: {
      _id: "",
      username: "",
    },
    updatedAt: "",
    storedAt: "",
    __v: 0,
    _id: "",
  };
  useEffect(() => {
    if (!reportQuery.data) return;
    if (!tagsQuery.data) return;
    console.log(reportQuery.data);
    setTags(
      reportQuery.data.smtcTags.map(
        (id) => tagsQuery.data?.find((tag) => tag._id === id) || emptyTag
      )
    );
  }, [tagsQuery.isSuccess]);

  const [addReportModal, setAddReportModal] = useState(false);
  function addReportsToIncidents() {
    setAddReportModal(true);
  }
  // refactor to be more pretty and have placeholders
  if (reportQuery.isLoading)
    return (
      <span className='pt-4 sticky top-0 font-medium text-center'>
        ...loading
      </span>
    );
  if (reportQuery.data) {
    console.log(reportQuery.data);
    return (
      <article className='pt-4 sticky top-0 overflow-y-auto max-h-[93vh] min-h-svh '>
        <AddReportsToIncidents
          selection={id ? [id] : undefined}
          isOpen={addReportModal}
          queryKey={["reports"]}
          onClose={() => setAddReportModal(false)}
        />
        <nav className='pl-3 pr-2 py-2 flex justify-between items-center rounded-lg text-xs border border-slate-300 mb-2 shadow-md bg-white'>
          <div className='flex gap-1 items-center'>
            <p>Mark as:</p>
            <AggieButton
              variant='secondary'
              onClick={() =>
                setRead.mutate({
                  reportIds: id ? [id] : [],
                  read: !reportQuery.data?.read,
                  currentPageId: id,
                })
              }
              loading={setRead.isLoading}
              disabled={!reportQuery.data || setRead.isLoading}
            >
              {reportQuery.data?.read ? <> unread</> : <> read</>}
            </AggieButton>
            <AggieButton
              variant='secondary'
              onClick={() =>
                setIrrelevance.mutate({
                  reportIds: id ? [id] : [],
                  irrelevant:
                    reportQuery.data?.irrelevant === "true" ? "false" : "true",
                  currentPageId: id,
                })
              }
              loading={setIrrelevance.isLoading}
              disabled={!reportQuery.data || setIrrelevance.isLoading}
            >
              {reportQuery.data?.irrelevant === "true" ? (
                <>relevant</>
              ) : (
                <>irrelevant</>
              )}
            </AggieButton>
          </div>
          <div className='flex gap-1'>
            <div className='flex font-medium'>
              <AggieButton
                className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-300 hover:bg-slate-200'
                onClick={addReportsToIncidents}
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
          <div className='grid grid-cols-4'>
            <p className='font-medium text-sm py-1 px-2 '>Source</p>
            <p className='col-span-3 '>
              {getSourceFromId(reportQuery.data._sources)}
            </p>
          </div>
          <div className='grid grid-cols-4'>
            <p className='font-medium text-sm py-1 px-2 '>Generated Tags</p>
            <p className='col-span-3 flex-wrap flex gap-1 '>
              <GeneratedTagsList
                tags={reportQuery.data.tags}
                tempHoverCSS='right-0'
              />
            </p>
          </div>
          <div className='grid grid-cols-4'>
            <p className='font-medium text-sm py-1 px-2 '>Tags</p>
            <p className='col-span-3'>
              Tags don't work right now
              {/* {tagsQuery.data && reportQuery.data._id && (
                <TagsTypeahead
                  id={reportQuery.data._id}
                  options={tagsQuery.data}
                  selected={tags}
                  onChange={setTags}
                  onBlur={() => {
                    tagsUpdateMutation.mutate({
                      reportId: reportQuery.data?._id || "",
                      tags: tags,
                    });
                  }}
                  variant={"table"}
                />
              )} */}
            </p>
          </div>
        </div>

        <SocialMediaPost report={reportQuery.data} showMedia />
      </article>
    );
  }
  return <> error loading page</>;
};

export default Report;
