import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getGroup, getGroupReports } from "../../../api/groups";
import AxiosErrorCard from "../../../components/AxiosErrorCard";
import TagsList from "../../../components/tag/TagsList";
import VeracityToken from "../../../components/VeracityToken";
import ReportListItemSmall from "../../Reports/ReportListItemSmall";

const Incident = () => {
  let { id } = useParams();
  const groupQuery = useQuery(["group", id], () => getGroup(id));
  const { data: groupReports } = useQuery(["reports", { groupId: id }], () =>
    getGroupReports(id, 0)
  );

  // TODO: refactor into its own component or something
  if (groupQuery.isLoading) {
    return <span>Loading...</span>;
  }

  if (groupQuery.isError) {
    return <AxiosErrorCard error={groupQuery.error} />;
  }
  return (
    <section className='max-w-screen-xl mx-auto px-2 grid grid-cols-3 pt-6 gap-3 overflow-y-hidden max-h-[90vh] h-full '>
      <main className='col-span-2 overflow-y-auto h-full'>
        <header className='text-slate-600 flex justify-between'>
          <div>
            <div className='flex gap-1'>
              <VeracityToken value={groupQuery.data?.veracity} />
              <TagsList values={groupQuery.data?.smtcTags} />
            </div>
            <h1 className='text-black text-3xl font-medium'>
              {groupQuery.data?.title}
            </h1>
            <div className='flex gap-12 mt-2'>
              <p>#{groupQuery.data?.idnum}</p>
              <p>{groupQuery.data?._reports.length} reports</p>
              <p>{groupQuery.data?.locationName}</p>
              <p>{groupQuery.data?.creator?.username}</p>
            </div>
          </div>
          <div>edit, more options</div>
        </header>
        <article className='mt-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-medimum'>Notes</h2>
            <button className='py-1 px-2 bg-slate-300'>
              {groupQuery.data?.notes ? "edit" : "+ add notes"}
            </button>
          </div>
          {groupQuery.data?.notes && (
            <p className='px-2 py-1 border border-slate-200 rounded whitespace-pre-line'>
              {groupQuery.data?.notes}
            </p>
          )}
        </article>
      </main>
      <aside className='overflow-y-auto h-full max-h-[80vh]'>
        <div className='flex flex-col gap-1'>
          {" "}
          {groupReports &&
            groupReports.results.map((report) => (
              <ReportListItemSmall report={report} />
            ))}
        </div>
      </aside>
    </section>
  );
};

export default Incident;
