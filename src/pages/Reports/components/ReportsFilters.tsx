import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "../../../hooks/useQueryParams";

import { getSources } from "../../../api/sources";
import { MEDIA_OPTIONS } from "../../../api/common";
import type { ReportQueryState } from "../../../api/reports/types";

import FilterComboBox from "../../../components/filters/FilterComboBox";
import FilterListbox from "../../../components/filters/FilterListBox";
import { Field, Form, Formik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmarkSquare } from "@fortawesome/free-solid-svg-icons";
import AggieButton from "../../../components/AggieButton";
import Pagination from "../../../components/Pagination";

interface IReportFilters {
  reportCount?: number;
  headerElement: React.ReactElement;
}

const ReportFilters = ({ reportCount, headerElement }: IReportFilters) => {
  const { searchParams, getParam, setParams, clearAllParams } =
    useQueryParams<ReportQueryState>();

  const sourcesQuery = useQuery(["sources"], getSources);

  function sourcesRemapComboBox(query: typeof sourcesQuery) {
    if (!query.data) return [];
    const array = query.data.map((source) => ({
      key: source._id,
      value: source.nickname,
    }));
    return [{ key: "", value: "All Sources" }, ...array];
  }

  return (
    <>
      <div></div>
      <div className='flex justify-between mb-2 '>
        <div className='flex gap-1'>
          <Formik
            initialValues={{ keywords: getParam("keywords") }}
            onSubmit={(e) => setParams(e)}
          >
            {({ resetForm }) => (
              <Form className='flex gap-2'>
                <div className='flex items-center focus-within-theme rounded-lg'>
                  <Field
                    name='keywords'
                    className='focus-theme px-2 py-1 border-y border-l border-slate-300 bg-white rounded-l-lg min-w-[20rem]'
                    placeholder='Search Keywords'
                  />
                  <AggieButton
                    type='submit'
                    className='px-4 py-1 h-full hover:bg-white bg-slate-100 rounded-r-lg border border-l-0 border-slate-30'
                    title='search'
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </AggieButton>
                </div>

                {!!searchParams.size && (
                  <AggieButton
                    className='hover:underline hover:bg-slate-100 px-2 py-1 text-sm rounded'
                    onClick={() => {
                      clearAllParams();
                      resetForm();
                    }}
                  >
                    <FontAwesomeIcon icon={faXmarkSquare} />
                    Clear All Parameters
                  </AggieButton>
                )}
              </Form>
            )}
          </Formik>
        </div>
        <div className='text-xs'>
          <Pagination
            currentPage={Number(getParam("page")) || 0}
            totalCount={reportCount || 0}
            onPageChange={(num) => setParams({ page: num })}
            size={0}
          />
        </div>
      </div>
      <div className='flex justify-between mb-2 text-sm'>
        <div className='flex gap-2'>{headerElement}</div>
        <div className='flex items-center gap-1'>
          <FilterListbox
            label='Platforms'
            options={[...MEDIA_OPTIONS]}
            value={getParam("media")}
            onChange={(e) => setParams({ media: e })}
          />
          <FilterComboBox
            label='Sources'
            list={sourcesRemapComboBox(sourcesQuery)}
            onChange={(e) => {
              setParams({ sourceId: e.key });
            }}
            selectedKey={getParam("sourceId")}
          />
        </div>
      </div>
    </>
  );
};

export default ReportFilters;
