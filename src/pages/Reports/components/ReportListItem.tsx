import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Report } from "../../../api/reports/types";
import { stringToDate } from "../../../helpers";
import { formatText } from "../../../utils/format";
import { getGroup } from "../../../api/groups";

import TagsList from "../../../components/tag/TagsList";
import SocialMediaIcon from "../../../components/SocialMediaPost/SocialMediaIcon";
import AggieCheck from "../../../components/AggieCheck";
import ReactTimeAgo from "react-time-ago";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import DateTime from "../../../components/DateTime";
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
  const queryClient = useQueryClient();
  const { id: currentPageId } = useParams();
  const navigate = useNavigate();

  const { data: incident } = useQuery(
    ["group", report._group],
    () => getGroup(report._group),
    { enabled: !!report._group }
  );
  function prettyDate(datestring: string) {
    // TODO: pretty dastes like "1 day ago" and "3 minutes ago"
  }

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
    navigate("/incidents/" + id);
  }

  return (
    <article
      className={`px-2 py-2 pb-4 border-b ${bgState()} ${
        currentPageId === report._id ? "ring-2 ring-inset rounded-lg" : ""
      } border-slate-300 text-sm text-slate-600 grid grid-cols-5 gap-2 relative`}
    >
      <div
        className={`col-span-4 pl-6 ${
          report.read ? "" : " border-l-2 border-blue-600 "
        }`}
      >
        {isSelectMode ? (
          <div
            className='flex items-center absolute inset-0 pointer-events-none'
            onClick={onChange}
          >
            <div className='w-full h-full pointer-events-auto cursor-pointer group hover:bg-blue-300/25 rounded p-2 pl-3 '>
              <div
                className={`w-4 h-4  border border-slate-500  group-hover:border-slate-600 grid place-items-center rounded ${
                  isChecked ? "bg-blue-500 text-slate-50" : "bg-white"
                }`}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size='xs' />}
              </div>
            </div>
          </div>
        ) : (
          <div className='opacity-0 group-hover:opacity-100 flex items-center absolute top-0 left-0 pointer-events-none p-2 pl-3 '>
            <AggieCheck active={isChecked} onClick={onChange} />
          </div>
        )}

        <header className='flex justify-between mb-2 '>
          <div>
            <div className='flex gap-1 text-sm items-baseline'>
              <h1 className={`text-sm text-black mx-1 font-medium `}>
                <span className='mr-2 text-slate-600 text-xs'>
                  <SocialMediaIcon mediaKey={report._media[0]} />
                </span>
                {report.author}
              </h1>
              <TagsList values={report.smtcTags} />
              {report.irrelevant && report.irrelevant === "true" && (
                <span className='px-2 text-sm font-medium bg-red-200 text-red-800'>
                  Irrelevant
                </span>
              )}
            </div>
          </div>
          <div className='text-xs flex gap-2'>
            <p>
              <DateTime dateString={report.authoredAt} />
            </p>
          </div>
        </header>
        <div>
          <p className=' text-black max-h-[10em] line-clamp-5'>
            {formatText(report.content)}
          </p>
        </div>
      </div>
      <div className='flex flex-col'>
        {/* <div className='flex gap-1 opacity-0 group-hover:opacity-100'>
          <AggieButton>test</AggieButton>
        </div> */}
        {!!report._group && !!incident ? (
          <div
            className='rounded-lg bg-slate-100 px-2 py-1 flex-grow border border-slate-200 hover:cursor-pointer hover:bg-white'
            onClick={(e) => onAttachedReportClick(e, incident._id)}
          >
            <p className='font-medium flex justify-between'>
              {incident?.title} <span>#{incident?.idnum}</span>
            </p>
            <p>({incident._reports.length}) total Reports</p>
          </div>
        ) : (
          <button className='rounded-lg flex-grow bg-slate-50 border border-dashed border-slate-200 grid place-items-center h-full'>
            Attach Incident
          </button>
        )}
      </div>
    </article>
  );
};

export default ReportListItem;
