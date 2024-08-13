import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "../../hooks/useQueryParams";

import { getUsers } from "../../api/users";
import { getSources } from "../../api/sources";
import { getTags } from "../../api/tags";
import { VERACITY_OPTIONS, ESCALATED_OPTIONS } from "../../api/enums";
import type { GroupSearchState } from "../../objectTypes";

import FilterComboBox from "../../components/filters/FilterComboBox";
import FilterListbox from "../../components/filters/FilterListBox";
import FilterRadioGroup from "../../components/filters/FilterRadioGroup";
import { Field, Form, Formik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const IncidentsFilters = () => {
  const { getParam, setParams } = useQueryParams<GroupSearchState>();

  const usersQuery = useQuery(["users"], getUsers);

  function usersRemapComboBox(query: typeof usersQuery) {
    if (!query.data) return [];
    const array = query.data.map((user) => ({
      key: user._id,
      value: user.username,
    }));
    return array;
  }

  function onSearch() {}
  return (
    <>
      <div className='flex justify-between mb-2 '>
        <div className='flex gap-1'>
          <Formik
            initialValues={{ title: getParam("title") }}
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
        <div className='flex gap-2'>
          <FilterRadioGroup
            options={[...VERACITY_OPTIONS]}
            defaultOption='All'
            value={getParam("veracity")}
            onChange={(e) => setParams({ veracity: e === "All" ? "" : e })}
          />
        </div>
        <div className='flex items-center gap-1'>
          <FilterListbox
            label='Escalated'
            options={[...ESCALATED_OPTIONS]}
            value={getParam("escalated")}
            onChange={(e) => setParams({ escalated: e })}
          />

          <FilterComboBox
            label='Creator'
            list={usersRemapComboBox(usersQuery)}
            onChange={(e) => {
              setParams({ creator: e.key });
            }}
            selectedKey={getParam("creator")}
          />
          <FilterComboBox
            label='Assignee'
            list={usersRemapComboBox(usersQuery)}
            onChange={(e) => {
              setParams({ assignedTo: e.key });
            }}
            selectedKey={getParam("assignedTo")}
            optionalItems={[{ key: "none", value: "Nobody" }]}
          />
        </div>
      </div>
    </>
  );
};

export default IncidentsFilters;
