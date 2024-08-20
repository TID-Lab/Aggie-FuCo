import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  getReport,
  setSelectedRead,
  setSelectedTags,
} from "../../../api/reports";
import TagsList from "../../../components/tag/TagsList";
import { formatAuthor, formatHashtag } from "../../../utils/format";
import Linkify from "linkify-react";
import AggieButton from "../../../components/AggieButton";
import { Listbox, Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faEnvelope,
  faEnvelopeOpen,
  faExternalLink,
  faFile,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { reportAuthorUrl, reportFullContent } from "../ReportHelpers";
import { getSources } from "../../../api/sources";
import { useQueryParams } from "../../../hooks/useQueryParams";
import type {
  ReportQueryState,
  Reports,
  Tag,
  Report as ReportType,
} from "../../../objectTypes";
import { getTags } from "../../../api/tags";
import TagsTypeahead from "../../../components/tag/TagsTypeahead";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { updateOneInList } from "../../../utils/immutable";
const Report = () => {
  let { id } = useParams();
  const { setParams } = useQueryParams<ReportQueryState>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

        const previousData = queryClient.getQueryData<Reports>(["reports"]);
        queryClient.setQueryData(["reports"], {
          ...previousData,
          results: previousData?.results.map((i) =>
            i._id === reportQuery.data?._id ? { ...i, smtcTags: tags } : i
          ),
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

  const setSingleReadMutation = useMutation({
    mutationFn: (params: { reportId: string | undefined; read: boolean }) => {
      if (!params.reportId) throw "error";
      return setSelectedRead([params.reportId], params.read);
    },
    onSuccess: (newData, variables) => {
      const previousData = queryClient.getQueryData<Reports>(["reports"]);
      if (previousData) {
        queryClient.setQueryData(["reports"], {
          ...previousData,
          results: updateOneInList(previousData.results, {
            _id: variables.reportId,
            read: variables.read,
          }),
        });
      }

      if (reportQuery.data) {
        queryClient.setQueryData(["report", id], {
          ...reportQuery.data,
          read: variables.read,
        });
      }
    },
  });

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
    console.log(reportQuery.data.smtcTags);
    setTags(
      reportQuery.data.smtcTags.map(
        (id) => tagsQuery.data?.find((tag) => tag._id === id) || emptyTag
      )
    );
  }, [tagsQuery.isSuccess]);
  if (reportQuery.isLoading) return <span>...loading</span>;
  if (reportQuery.data) {
    console.log(reportQuery.data.metadata);
    return (
      <article className='pt-4 sticky top-0 overflow-y-auto max-h-[93vh] '>
        <nav className='px-2 py-2 flex justify-between items-center text-sm border border-slate-300 mb-2 shadow-md'>
          <h2 className='text-sm font-medium'>Quick Actions</h2>
          <div className='flex gap-1'>
            <AggieButton
              className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
              onClick={() =>
                setSingleReadMutation.mutate({
                  reportId: id,
                  read: !reportQuery.data?.read,
                })
              }
              disabled={!reportQuery.data || setSingleReadMutation.isLoading}
            >
              {setSingleReadMutation.isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className='animate-spin' />
              ) : (
                <FontAwesomeIcon
                  icon={reportQuery.data?.read ? faEnvelope : faEnvelopeOpen}
                />
              )}
              {reportQuery.data?.read ? <>mark unread</> : <>mark read</>}
            </AggieButton>
            <div className='flex font-medium'>
              <AggieButton
                className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
                onClick={newIncidentFromReport}
              >
                <FontAwesomeIcon icon={faPlus} />
                Attach Incident
              </AggieButton>
              <Menu as='div' className='relative'>
                <Menu.Button className='px-2 py-1 rounded-r-lg bg-slate-100 border-y border-r border-slate-200 hover:bg-slate-200 ui-open:bg-slate-300'>
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
                        onClick={newIncidentFromReport}
                      >
                        <FontAwesomeIcon icon={faFile} />
                        Create New Incident with Report
                      </AggieButton>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </nav>
        <div className='flex flex-col gap-1 my-2'>
          <div className='grid grid-cols-3'>
            <p className='font-medium text-sm py-1 px-2 '> Author</p>
            <p className='col-span-2'>
              {formatAuthor(reportQuery.data.author, reportQuery.data._media)}
              <a
                target='_blank'
                href={reportAuthorUrl(reportQuery.data)}
                className='ml-1 px-2 py-1 rounded-full border border-slate-200 font-medium text-xs inline-flex gap-1 items-center bg-slate-100 hover:bg-white'
              >
                Profile
                <FontAwesomeIcon icon={faExternalLink} size='sm' />
              </a>
            </p>
          </div>
          <div className='grid grid-cols-3'>
            <p className='font-medium text-sm py-1 px-2 '> Platform</p>
            <p className='col-span-2'>{reportQuery.data._media}</p>
          </div>
          <div className='grid grid-cols-3'>
            <p className='font-medium text-sm py-1 px-2 '>Source</p>
            <p className='col-span-2 '>
              {getSourceFromId(reportQuery.data._sources)}
            </p>
          </div>
          <div className='grid grid-cols-3'>
            <p className='font-medium text-sm py-1 px-2 '>Tags</p>
            <p className='col-span-2'>
              {tagsQuery.data && reportQuery.data._id && (
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
              )}
            </p>
          </div>
        </div>

        <div className='pt-1 pb-2  bg-white rounded-xl border border-slate-200 text-base'>
          <div className='px-3 pt-2'>
            <div className='flex justify-between mb-2'>
              <div className=' font-medium  '>
                <h1>
                  {formatAuthor(
                    reportQuery.data.author,
                    reportQuery.data._media
                  )}
                </h1>
                <p className='text-slate-600 text-xs font-normal mt-1'>
                  {new Date(reportQuery.data.authoredAt).toLocaleString(
                    "en-us"
                  )}
                </p>
              </div>
              <p className='flex flex-col items-end gap-1'>
                <a
                  target='_blank'
                  href={reportQuery.data.url}
                  className='ml-1 px-2 py-1 rounded-full border border-slate-200 font-medium text-xs inline-flex gap-1 items-center bg-slate-100 hover:bg-white'
                >
                  <p>Original Post</p>
                  <FontAwesomeIcon icon={faExternalLink} />
                </a>
              </p>
            </div>

            <p className=''>
              <Linkify
                options={{
                  target: "_blank",
                  className: "underline text-blue-600 hover:bg-slate-100 ",
                }}
              >
                {reportFullContent(reportQuery.data)
                  .split(" ")
                  .map((word: unknown, index) =>
                    formatHashtag(word, "text-slate-600", index)
                  )}
              </Linkify>
            </p>
          </div>
        </div>
      </article>
    );
  }
  return <> bruh</>;
};

export default Report;
