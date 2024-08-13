import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getReport } from "../../../api/reports";
import TagsList from "../../../components/tag/TagsList";

const Report = () => {
  let { id } = useParams();
  const reportQuery = useQuery(["report", id], () => getReport(id));

  if (reportQuery.isLoading) return <span>...loading</span>;
  if (reportQuery.data) {
    console.log(reportQuery.data.metadata);
    return (
      <article className='pt-4 sticky top-0'>
        <nav className='px-2 py-2 flex justify-between items-center text-sm border border-slate-300 mb-2 shadow-md'>
          <h2 className='text-sm font-medium'>Quick Actions</h2>
          <div className='flex gap-1'>
            <button className='px-2 py-1 rounded-lg bg-slate-300'>
              mark unread
            </button>
            <button className='px-2 py-1 rounded-lg bg-slate-300'>
              add to group
            </button>
          </div>
        </nav>
        <div>
          <TagsList values={reportQuery.data.smtcTags} />
          <h1 className='text-base font-medium'>{reportQuery.data.author}</h1>
          <p> {reportQuery.data.content}</p>
          <p>{reportQuery.data._id}</p>
        </div>
      </article>
    );
  }
  return <> bruh</>;
};

export default Report;
