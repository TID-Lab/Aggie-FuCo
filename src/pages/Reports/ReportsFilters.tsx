import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "../../hooks/useQueryParams";

import { getUsers } from "../../api/users";
import { getSources } from "../../api/sources";
import { getTags } from "../../api/tags";
import { MEDIA_OPTIONS, ESCALATED_OPTIONS } from "../../api/enums";
import type { GroupSearchState, ReportQueryState } from "../../objectTypes";

import FilterComboBox from "../../components/filters/FilterComboBox";
import FilterListbox from "../../components/filters/FilterListBox";
import FilterRadioGroup from "../../components/filters/FilterRadioGroup";
import { Field, Form, Formik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ReportFilters = () => {
  const { getParam, setParams } = useQueryParams<ReportQueryState>();

  const sourcesQuery = useQuery(["sources"], getSources);

  function sourcesRemapComboBox(query: typeof sourcesQuery) {
    if (!query.data) return [];
    const array = query.data.map((source) => ({
      key: source._id,
      value: source.nickname,
    }));
    return [{ key: "", value: "All Sources" }, ...array];
  }

  function onSearch() {}
  return (
    <>
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
      </div>
      <div className='flex justify-between mb-2 text-sm'>
        <div className='flex gap-2'></div>
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
            selectedItem={sourcesRemapComboBox(sourcesQuery).find(
              (i) => i.key === getParam("sourceId")
            )}
          />
        </div>
      </div>
    </>
  );
};

export default ReportFilters;
