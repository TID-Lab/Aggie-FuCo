import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";
import { ReportQueryState } from "../../objectTypes";
import { getReports } from "../../api/reports";
import ReportsFilters from "./ReportsFilters";
import { Link } from "react-router-dom";
import ReportListItem from "./ReportListItem";

const Reports = () => {
  const { searchParams, getAllParams, setParams } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  useEffect(() => {
    // refetch on filter change
    reportsQuery.refetch();
  }, [searchParams]);
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3'>
      <main className='col-span-2 '>
        <header className='my-4 col-span-3'>
          <h1 className='text-3xl'>Reports</h1>
        </header>
        <ReportsFilters />

        <div className='flex flex-col border border-slate-200 rounded-lg'>
          {reportsQuery.isSuccess &&
            reportsQuery.data?.results.map((report) => (
              <Link
                to={"/report/" + report._id}
                className={"group no-underline"}
                key={report._id}
              >
                <ReportListItem report={report} />
              </Link>
            ))}
        </div>
      </main>
      <aside className='col-span-1'>wao 2</aside>
    </section>
  );
};

export default Reports;
