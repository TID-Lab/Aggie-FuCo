import TagsList from "../../components/tag/TagsList";
import { Report } from "../../objectTypes";
import { stringToDate } from "../../helpers";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

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
  function prettyDate(datestring: string) {
    // TODO: pretty dastes like "1 day ago" and "3 minutes ago"
  }

  function onChange(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    onCheckChange();
  }
  return (
    <article className='px-2 py-2 border-b border-slate-200 hover:bg-slate-50 text-sm text-slate-600 grid grid-cols-5 gap-2 relative'>
      <div className='col-span-4 pl-6'>
        {isSelectMode && (
          <div
            className='flex items-center absolute inset-0 pointer-events-none'
            onClick={onChange}
          >
            <div className='w-full h-full pointer-events-auto cursor-pointer group hover:bg-blue-400/25 rounded p-2 '>
              <div
                className={`w-4 h-4  border border-slate-400 group-hover:border-slate-600 grid place-items-center rounded ${
                  isChecked ? "bg-blue-500 text-slate-50" : ""
                }`}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size='xs' />}
              </div>
            </div>
          </div>
        )}

        <header className='flex justify-between mb-2 '>
          <div>
            <div className='flex gap-1 text-sm items-baseline'>
              <span className='px-2 bg-slate-200 font-medium '>Unread</span>
              <h1 className='text-sm font-medium text-black mx-1'>
                {report.author} {isChecked ? "true" : "false"}
              </h1>
              <TagsList values={report.smtcTags} />
            </div>
          </div>
          <div className='text-sm flex gap-2'>
            <p>
              {stringToDate(report.authoredAt).toLocaleTimeString()}{" "}
              {stringToDate(report.authoredAt).toLocaleDateString()}
            </p>
          </div>
        </header>
        <div>
          <p className='max-w-lg text-black'>{report.content}</p>
        </div>
      </div>
      <div>blah</div>
    </article>
  );
};

export default ReportListItem;
