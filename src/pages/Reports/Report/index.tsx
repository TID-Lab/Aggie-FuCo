import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getReport } from "../../../api/reports";
import TagsList from "../../../components/tag/TagsList";

const Report = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const reportQuery = useQuery(["report", id], () => getReport(id));

  function newIncidentFromReport() {
    const params = new URLSearchParams({
      reports: [id].toString(),
    });

    navigate("/incidents/new?" + params.toString());
  }

  if (reportQuery.isLoading) return <span>...loading</span>;
  if (reportQuery.data) {
    console.log(reportQuery.data.metadata);
    return (
      <article className='pt-4 sticky top-0 overflow-y-auto max-h-[93vh] pr-2'>
        <nav className='px-2 py-2 flex justify-between items-center text-sm border border-slate-300 mb-2 shadow-md'>
          <h2 className='text-sm font-medium'>Quick Actions</h2>
          <div className='flex gap-1'>
            <button className='px-2 py-1 rounded-lg bg-slate-300'>
              mark unread
            </button>
            <button
              className='px-2 py-1 rounded-lg bg-slate-300'
              onClick={newIncidentFromReport}
            >
              add to group
            </button>
          </div>
        </nav>
        <div className='py-2  bg-slate-50 rounded-xl border border-slate-200'>
          <div className='px-3 pb-1 border-b flex justify-between text-sm'>
            <p>platform: {reportQuery.data._media}</p>
            <p>open post in new window</p>
          </div>
          <div className='px-3 pt-2'>
            <TagsList values={reportQuery.data.smtcTags} />
            <h1 className='text-lg font-medium'>{reportQuery.data.author}</h1>
            <p className='text-lg'> {reportQuery.data.content}</p>
            <p>{reportQuery.data._id}</p>
          </div>
        </div>
      </article>
    );
  }
  return <> bruh</>;
};

export default Report;
