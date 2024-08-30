import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useOutlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";

import type { ReportQueryState } from "../../objectTypes";
import { getReports } from "../../api/reports";

import AddReportsToIncidents from "./AddReportsToIncident";
import { formatPageCount } from "../../utils/format";

import AllReportsList from "./AllReportsList";
import { Tab } from "@headlessui/react";
import BatchReportList from "./BatchReportsList";

const Reports = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));

  const [addReportModal, setAddReportModal] = useState(false);
  function addReportsToIncidents() {
    setAddReportModal(true);
  }
  function navigateToReport(id: string) {
    navigate({ pathname: id, search: searchParams.toString() });
  }
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-3'>
      {/* <AddReportsToIncidents
        reports={reportsQuery.data?.results?.filter((i) =>
          multiSelect.exists(i._id)
        )}
        isOpen={addReportModal}
        onClose={() => setAddReportModal(false)}
      /> */}
      <main className='col-span-2 '>
        <Tab.Group
          onChange={(index) => {
            // unset report page
            navigate({ pathname: "/reports", search: searchParams.toString() });
          }}
        >
          <div className='flex justify-between text-slate-500 mt-3 mb-1'>
            <Tab.List className={"text-3xl font-medium flex gap-1"}>
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
              <AllReportsList
                onAttachIncident={addReportsToIncidents}
                onNavigateReport={navigateToReport}
              />
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
