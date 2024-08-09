import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";
import { ReportQueryState } from "../../objectTypes";
import { getReports } from "../../api/reports";
import ReportsFilters from "./ReportsFilters";
import { Link, Outlet } from "react-router-dom";
import ReportListItem from "./ReportListItem";
import AggiePagination from "../../components/AggiePagination";

const Reports = () => {
  const { searchParams, getAllParams, setParams } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  useEffect(() => {
    // refetch on filter change
    reportsQuery.refetch();
  }, [searchParams]);
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-4'>
      <main className='col-span-2 '>
        <header className='my-4 col-span-3'>
          <h1 className='text-3xl'>
            All Reports <span className='text-slate-400'>Batch Mode</span>
          </h1>
        </header>
        {reportsQuery.data && reportsQuery.data.total && (
          <AggiePagination
            size='sm'
            itemsPerPage={50}
            total={reportsQuery.data.total}
            goToPage={(num) => setParams({ page: num })}
          />
        )}
        <ReportsFilters />

        <div className='flex flex-col border border-slate-200 rounded-lg'>
          {reportsQuery.isSuccess &&
            reportsQuery.data?.results.map((report) => (
              <Link
                to={"/reports/" + report._id}
                className={"group no-underline"}
                key={report._id}
              >
                <ReportListItem report={report} />
              </Link>
            ))}
        </div>
        {reportsQuery.data && reportsQuery.data.total && (
          <AggiePagination
            size='sm'
            itemsPerPage={50}
            total={reportsQuery.data.total}
            goToPage={(num) => setParams({ page: num })}
          />
        )}
      </main>
      <aside className='col-span-1'>
        <Outlet />
      </aside>
    </section>
  );
};

export default Reports;
