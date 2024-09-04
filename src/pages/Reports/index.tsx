import { useQuery } from "@tanstack/react-query";
import { useOutlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";

import type { Report, ReportQueryState } from "../../api/reports/types";
import { getReports } from "../../api/reports";
import { formatPageCount } from "../../utils/format";

import { Tab } from "@headlessui/react";
import AddReportsToIncidents from "./components/AddReportsToIncident";
import AllReportsList from "./AllReportsList";
import BatchReportList from "./BatchReportsList";

const Reports = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { searchParams, getAllParams, getParam } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-3'>
      <main className='col-span-2 '>
        <Tab.Group
          defaultIndex={!!getParam("batch") ? 1 : 0}
          onChange={(index) => {
            // unset report page
            navigate({ pathname: "/reports", search: searchParams.toString() });
          }}
        >
          <div className='flex justify-between text-slate-500 mt-3 mb-1'>
            <Tab.List className={"text-3xl font-medium flex"}>
              <Tab className='focus-theme ui-selected:text-black hover:bg-slate-200 ui-selected:hover:bg-transparent rounded-lg px-2 py-1'>
                <h1 className=''>All Reports</h1>
              </Tab>
              <Tab className='focus-theme ui-selected:text-black hover:bg-slate-200 ui-selected:hover:bg-transparent rounded-lg px-2 py-1'>
                <h1 className=''>Batch Mode</h1>
              </Tab>
            </Tab.List>
            <p className='font-medium text-sm'>
              {formatPageCount(
                Number(getParam("page")),
                50,
                reportsQuery.data?.total
              )}
            </p>
          </div>

          <Tab.Panels>
            <Tab.Panel>
              <AllReportsList />
            </Tab.Panel>
            <Tab.Panel>
              <BatchReportList />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
      <aside className='col-span-1'>
        {!outlet || !outlet.type ? (
          <p className='grid w-full py-24 place-items-center font-medium sticky top-2 bg-slate-50 rounded-lg mt-4'>
            Select a report to view in this window
          </p>
        ) : (
          outlet
        )}
      </aside>
    </section>
  );
};

export default Reports;
