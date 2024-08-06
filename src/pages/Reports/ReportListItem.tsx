import TagsList from "../../components/tag/TagsList";
import { Report } from "../../objectTypes";

interface IProps {
  report: Report;
}

const ReportListItem = ({ report }: IProps) => {
  return (
    <article className='px-2 py-1 border-b border-slate-200 hover:bg-slate-50 text-sm text-slate-600'>
      <header>
        <div className='flex gap-1'>
          <span className='px-2 bg-slate-200 font-medium text-slate-800'>
            Unread
          </span>
          <TagsList values={report.smtcTags} />
        </div>
      </header>
      {report._id}
    </article>
  );
};

export default ReportListItem;
