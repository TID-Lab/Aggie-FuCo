import TagsList from "../../components/tag/TagsList";
import { Report } from "../../objectTypes";
import { stringToDate } from "../../helpers";

interface IProps {
  report: Report;
}

const ReportListItem = ({ report }: IProps) => {
  return (
    <article className='px-2 py-2 border-b border-slate-200 hover:bg-slate-50 text-sm text-slate-600'>
      <header className='flex justify-between mb-2'>
        <div>
          <div className='flex gap-1 text-sm items-baseline'>
            <span className='px-2 bg-slate-200 font-medium '>Unread</span>
            <h1 className='text-sm font-medium text-black mx-1'>
              {report.author}
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
        <p className='max-w-md text-black'>{report.content}</p>
      </div>
    </article>
  );
};

export default ReportListItem;
