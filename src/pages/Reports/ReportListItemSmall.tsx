import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Linkify from "linkify-react";
import TagsList from "../../components/tag/TagsList";
import { Report } from "../../objectTypes";
import { formatAuthor, formatText } from "../../utils/format";

interface IReportListItemSmall {
  report: Report;
}

const ReportListItemSmall = ({ report }: IReportListItemSmall) => {
  return (
    <div className='pt-1 pb-2  bg-white rounded-xl border border-slate-200 text-base'>
      <div className='px-3 pt-2'>
        <div className='flex justify-between mb-2'>
          <TagsList values={report.smtcTags} />
          <div className=' font-medium  '>
            <h1>{formatAuthor(report.author, report._media)}</h1>
            <p className='text-slate-600 text-xs font-normal mt-1'>
              {new Date(report.authoredAt).toLocaleString("en-us")}
            </p>
          </div>
          <p className='flex flex-col items-end gap-1'>
            <a
              target='_blank'
              href={report.url}
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
            {formatText(report.content)}
          </Linkify>
        </p>
      </div>
    </div>
  );
};

export default ReportListItemSmall;
