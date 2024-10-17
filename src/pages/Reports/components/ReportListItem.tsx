// this component is uh... one of the components of all time
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { Report, ReportQueryState } from "../../../api/reports/types";
import { formatText } from "../../../utils/format";
import { getGroup } from "../../../api/groups";

import TagsList from "../../../components/Tags/TagsList";
import SocialMediaIcon from "../../../components/SocialMediaPost/SocialMediaIcon";
import AggieCheck from "../../../components/AggieCheck";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faDotCircle,
  faEnvelope,
  faEnvelopeOpen,
  faExclamationTriangle,
  faMinusCircle,
  faPlus,
  faRetweet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DateTime from "../../../components/DateTime";
import GeneratedTagsList from "../../../components/GeneratedTagsList";
import {
  parseContentType,
  sanitize,
} from "../../../components/SocialMediaPost/reportParser";
import AggieButton from "../../../components/AggieButton";
import { useReportMutations } from "../useReportMutations";
import AddReportsToIncidents from "./AddReportsToIncident";
import { useQueryParams } from "../../../hooks/useQueryParams";
import AggieToken from "../../../components/AggieToken";
import { parseYoutube } from "../../../components/SocialMediaPost/YoutubePost";
//TODO: refactor and clean up tech debt
interface IProps {
  report: Report;
  isChecked: boolean;
  isSelectMode: boolean;
  onCheckChange: () => void;
}

const ReportListItem = ({
  report,
  isChecked,
  isSelectMode,
  onCheckChange,
}: IProps) => {
  const contentType = parseContentType(report);

  const { id: currentPageId } = useParams();

  const { getParam } = useQueryParams<ReportQueryState>();

  const isBatchMode = getParam("batch") === "true";

  const { setRead, setIrrelevance } = useReportMutations({
    key: isBatchMode ? ["batch"] : ["reports"],
  });

  const { data: incident } = useQuery(
    ["group", report._group],
    () => getGroup(report._group),
    { enabled: !!report._group }
  );

  const [openAttachModal, setOpenAttachModal] = useState(false);

  function onChange(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    onCheckChange();
  }
  // refactor at some point
  function bgState() {
    if (isChecked && !isSelectMode)
      return "border-2 border-slate-300 bg-slate-100 rounded-lg ";
    else if (isChecked && isSelectMode) return "bg-blue-100 ";
    else if (report.read) return "bg-slate-100 hover:bg-slate-50 ";
    return "bg-white hover:bg-slate-50";
  }

  function onAttachedReportClick(
    e: React.MouseEvent<HTMLDivElement>,
    id: string
  ) {
    e.stopPropagation();
    window.open(`${window.location.origin}/incidents/${id}`, "_blank");
  }

  function renderText(type: typeof contentType) {
    switch (type) {
      case "twitter:quoteRetweet":
      case "twitter:retweet":
        return (
          <>
            <div className='grid place-items-center'>
              <FontAwesomeIcon icon={faRetweet} />
            </div>
            <p className=' text-black max-h-[10em] line-clamp-4'>
              {formatText(report.content)}
            </p>
          </>
        );
      case "truthsocial":
        return (
          <p
            className='truthsocial text-black'
            dangerouslySetInnerHTML={{
              __html: sanitize(report.content),
            }}
          ></p>
        );
      case "youtube":
        const { title, description } = parseYoutube(report);
        return (
          <p className=' text-black max-h-[10em] line-clamp-4'>
            <span className=''>{title} </span>
          </p>
        );
      default:
        return (
          <p className=' text-black max-h-[10em] line-clamp-4'>
            {formatText(report.content)}
          </p>
        );
    }
  }

  return (
    <article
      className={`px-2 py-2 pb-4 border-b ${bgState()} ${
        currentPageId === report._id ? "ring-2 ring-inset rounded-lg" : ""
      } border-slate-300 text-sm text-slate-600 grid grid-cols-5 gap-2 relative`}
    >
      <div
        className={`col-span-4 pl-7  ${
          report.read ? "" : " border-l-2 border-blue-600 "
        }`}
      >
        {isSelectMode ? (
          <div
            className='flex items-center absolute top-0 bottom-0 left-0 w-12 pointer-events-none '
            onClick={onChange}
          >
            <div className='w-full h-full pointer-events-auto cursor-pointer group hover:bg-blue-200/25 rounded p-2 pl-3 '>
              <div
                className={`w-4 h-4  border border-slate-500  group-hover:border-slate-600 grid place-items-center rounded ${
                  isChecked ? "bg-blue-500 text-slate-50" : "bg-white"
                }`}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size='xs' />}
              </div>
            </div>
            <div className='absolute ml-8 pointer-events-none h-full my-3 border-r border-slate-300'></div>
          </div>
        ) : (
          <div className='opacity-0 group-hover:opacity-100 flex items-center absolute top-0 left-0 pointer-events-none p-2 pl-3 '>
            <AggieCheck active={isChecked} onClick={onChange} />
          </div>
        )}

        <header className='flex justify-between mb-2 relative'>
          <div className='flex flex-wrap gap-1 text-sm items-baseline max-w-[43em]'>
            <h1 className={`text-sm text-black mx-1 font-medium `}>
              <span className='mr-2 text-slate-600 text-xs'>
                <SocialMediaIcon mediaKey={report._media[0]} />
              </span>
              {report.author}
            </h1>

            {report.irrelevant && report.irrelevant === "true" && (
              <AggieToken
                variant='light:red'
                icon={faXmark}
                className='text-xs'
              >
                Irrelevant
              </AggieToken>
            )}
            {report.red_flag && (
              <AggieToken
                variant='dark:red'
                icon={faExclamationTriangle}
                className='text-xs'
              >
                Red Flag
              </AggieToken>
            )}
            <GeneratedTagsList tags={report.aitags} />
            <TagsList values={report.smtcTags} />
          </div>
          <div className='text-xs group-hover:opacity-0'>
            <DateTime dateString={report.authoredAt} />
          </div>
          <div className='flex absolute right-0 top-0 text-xs shadow-md rounded-lg border border-slate-300 group-hover:opacity-100 opacity-0'>
            <AggieButton
              variant={report.read ? "light:lime" : "light:amber"}
              className='rounded-l-lg'
              onClick={(e) => {
                e.stopPropagation();

                setRead.mutate({
                  reportIds: [report._id],
                  read: !report.read,
                  currentPageId: currentPageId,
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
                  currentPageId: currentPageId,
                });
              }}
              icon={report.irrelevant === "true" ? faDotCircle : faXmark}
              loading={setIrrelevance.isLoading}
              disabled={!report || setIrrelevance.isLoading}
            >
              {report.irrelevant === "true" ? <>relevant</> : <>irrelevant</>}
            </AggieButton>
          </div>
        </header>
        <div className='flex gap-2'>{renderText(contentType)}</div>
      </div>
      <div className='flex flex-col'>
        {/* <div className='flex gap-1 opacity-0 group-hover:opacity-100'>
          <AggieButton>test</AggieButton>
        </div> */}
        {!!report._group && !!incident ? (
          <div
            className='rounded-lg text-slate-700 bg-slate-50 px-2 py-1 flex-grow border border-slate-300 hover:cursor-pointer hover:bg-white'
            onClick={(e) => onAttachedReportClick(e, incident._id)}
          >
            <p className='font-medium flex justify-between'>
              <span>
                {incident?.title}{" "}
                {incident?.escalated && (
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className='text-red-600'
                  />
                )}{" "}
                {incident?.closed && (
                  <FontAwesomeIcon
                    icon={faMinusCircle}
                    className='text-purple-600'
                  />
                )}
              </span>{" "}
              <span>#{incident?.idnum}</span>
            </p>
            <p>({incident._reports.length}) total Reports</p>
          </div>
        ) : (
          <AggieButton
            onClick={(e) => {
              e.stopPropagation();
              setOpenAttachModal(true);
            }}
            className='rounded-lg flex-grow flex gap-1 bg-slate-50 border border-dashed hover:border-slate-300 border-slate-300 focus-theme hover:bg-white justify-center items-center h-full'
            icon={faPlus}
          >
            Add to Incident
          </AggieButton>
        )}
      </div>
      <AddReportsToIncidents
        selection={[report._id]}
        isOpen={openAttachModal}
        queryKey={["reports"]}
        onClose={() => setOpenAttachModal(false)}
      />
    </article>
  );
};

export default ReportListItem;
