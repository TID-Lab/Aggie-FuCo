import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useQueryParams } from "../../hooks/useQueryParams";
import type {
  ReportQueryState,
  Reports as ReportsType,
} from "../../objectTypes";
import { getReports } from "../../api/reports";
import ReportsFilters from "./ReportsFilters";
import { Link, useOutlet, useNavigate } from "react-router-dom";
import ReportListItem from "./ReportListItem";
import AggiePagination from "../../components/AggiePagination";
import {
  faCheck,
  faEnvelope,
  faEnvelopeOpen,
  faMinus,
  faSearch,
  faX,
  faXmark,
  faXmarkCircle,
  faXmarkSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Formik, Field } from "formik";
import { Form } from "react-bootstrap";
import AggieButton from "../../components/AggieButton";

const Reports = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();

  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();

  const reportsQuery = useQuery(["reports"], () => getReports(getAllParams()));
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  function onSelectionChange(id: string) {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }
  function selectAll(data: ReportsType | undefined) {
    if (!data || data.results.length === 0) return;

    if (selectedItems.length === data.results.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.results.map((report) => report._id));
    }
  }
  function onSelectModeChange() {
    if (selectMode) {
      setSelectedItems([]);
      setSelectMode(false);
    } else setSelectMode(true);
  }
  function onReportItemClick(id: string) {
    navigate(id);
  }
  useEffect(() => {
    // refetch on filter change
    reportsQuery.refetch();
  }, [searchParams]);

  function onSearch() {}

  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-4'>
      <main className='col-span-2 '>
        <header className='my-4 col-span-3'>
          <h1 className='text-3xl'>
            All Reports <span className='text-slate-400'>Batch Mode</span>
          </h1>
        </header>
        <div className='flex justify-between mb-2 '>
          <div className='flex gap-1'>
            <Formik
              initialValues={{ keywords: getParam("keywords") }}
              onSubmit={(e) => setParams(e)}
            >
              <Form>
                <Field
                  name='title'
                  className='px-2 py-1 border border-r-0 border-slate-300 bg-slate-50 rounded-l-lg min-w-[20rem]'
                  placeholder='search for title, something, and something'
                />
                <button
                  type='submit'
                  onClick={onSearch}
                  className='px-4 py-1 bg-slate-100 rounded-r-lg border border-l-0 border-slate-30'
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </Form>
            </Formik>
          </div>
          {reportsQuery.data && reportsQuery.data.total && (
            <AggiePagination
              size='sm'
              itemsPerPage={50}
              total={reportsQuery.data.total}
              goToPage={(num) => setParams({ page: num })}
            />
          )}
        </div>
        <div className='px-1 py-2 bg-white/75 backdrop-blur-sm sticky top-0 z-10 '>
          <div className='flex justify-between items-center'>
            <AggieButton
              className='text-xs font-medium  bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-200'
              onClick={onSelectModeChange}
            >
              {selectMode ? "Cancel Selection" : "Select Mode"}
            </AggieButton>
            <ReportsFilters />
          </div>
          <div className='px-1 flex gap-2 text-xs font-medium items-center'>
            {selectMode && (
              <>
                <div
                  className='pointer-events-auto cursor-pointer group -m-2 hover:bg-blue-300/25 rounded-lg p-2 '
                  onClick={() => selectAll(reportsQuery.data)}
                >
                  <div
                    className={`w-4 h-4  border border-slate-400 group-hover:border-slate-600 grid place-items-center rounded ${
                      selectedItems.length > 0
                        ? "bg-blue-500 text-slate-50"
                        : ""
                    }`}
                  >
                    {selectedItems.length > 0 && (
                      <FontAwesomeIcon
                        icon={
                          selectedItems.length ===
                          reportsQuery.data?.results.length
                            ? faCheck
                            : faMinus
                        }
                        size='xs'
                      />
                    )}
                  </div>
                </div>
                <p>
                  Mark {selectedItems.length} report{"(s)"} as:
                </p>
                <div className=' rounded-lg flex overflow-hidden min-w-fit'>
                  <AggieButton
                    className='py-1 px-2 hover:bg-lime-200 bg-lime-100 text-lime-800'
                    disabled={selectedItems.length === 0}
                  >
                    <FontAwesomeIcon icon={faEnvelopeOpen} />
                    Read
                  </AggieButton>
                  <AggieButton
                    className='py-1 px-2 hover:bg-amber-200 bg-amber-100 text-amber-800'
                    disabled={selectedItems.length === 0}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Unread
                  </AggieButton>
                </div>
                <AggieButton
                  className='bg-rose-200 text-rose-800 border border-rose-500 border-none  px-2 py-1 rounded-lg hover:bg-rose-300'
                  disabled={selectedItems.length === 0}
                >
                  <FontAwesomeIcon icon={faXmark} />
                  Not Relevant
                </AggieButton>
              </>
            )}
          </div>
        </div>

        <div className='flex flex-col border border-slate-200 rounded-lg'>
          {reportsQuery.isSuccess &&
            reportsQuery.data?.results.map((report) => (
              <div
                onClick={() => onReportItemClick(report._id)}
                className='cursor-pointer'
                key={report._id}
              >
                <ReportListItem
                  report={report}
                  isChecked={selectedItems.includes(report._id)}
                  isSelectMode={selectMode}
                  onCheckChange={() => onSelectionChange(report._id)}
                />
              </div>
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
        {!outlet || !outlet.type ? (
          <p className='grid w-full py-24 place-items-center font-medium sticky top-2'>
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
