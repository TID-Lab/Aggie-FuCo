import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getGroups } from "../../api/groups";
import { getSources } from "../../api/sources";
import { getTags } from "../../api/tags";
import { getUsers } from "../../api/users";
import IncidentListItem from "./incidentListItem";
import { Link } from "react-router-dom";
import AggiePagination from "../../components/AggiePagination";
import { Formik, Form, Field } from "formik";
import { GroupSearchState } from "../../objectTypes";
import _ from "lodash";
import { useQueryParams } from "../../hooks/useQueryParams";
import FilterComboBox from "../../components/filters/FilterComboBox";
import { useEffect } from "react";
import FilterListbox from "../../components/filters/FilterListBox";
import { ESCALATED_OPTIONS, VERACITY_OPTIONS } from "../../api/enums";
import FilterRadioGroup from "../../components/filters/FilterRadioGroup";
const initialQueryValues: GroupSearchState = {
  creator: "",
  idnum: "",
  veracity: "",
  escalated: "",
  closed: "",
  before: "",
  after: "",
  totalReports: "",
  assignedTo: "",
};

const Incidents = () => {
  const { searchParams, getParam, getAllParams, setParams } =
    useQueryParams<GroupSearchState>();
  const sourcesQuery = useQuery(["sources"], getSources);
  const usersQuery = useQuery(["users"], getUsers);
  function usersComboBox(query: typeof usersQuery) {
    if (!query.data) return [];
    const array = query.data.map((user) => ({
      key: user._id,
      value: user.username,
    }));
    return [{ key: "", value: "All Users" }, ...array];
  }

  const groupsQuery = useQuery(["groups"], () => getGroups(getAllParams()));
  useEffect(() => {
    groupsQuery.refetch();
  }, [searchParams]);
  return (
    <section className='max-w-screen-xl mx-auto px-2'>
      <header className='my-4'>
        <h1 className='text-3xl'>Incidents</h1>
      </header>
      <Formik
        initialValues={{ ...initialQueryValues, ...getAllParams() }}
        onSubmit={(values) => {
          setParams(values);
        }}
      >
        <Form></Form>
      </Formik>
      <nav className='flex justify-between mb-2 text-sm'>
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
            list={usersComboBox(usersQuery)}
            onChange={(e) => {
              setParams({ creator: e.key });
            }}
            selectedItem={usersComboBox(usersQuery).find(
              (i) => i.key === getParam("creator")
            )}
          />
          <FilterComboBox
            label='Assignee'
            list={usersComboBox(usersQuery)}
            onChange={(e) => {
              setParams({ assignedTo: e.key });
            }}
            selectedItem={usersComboBox(usersQuery).find(
              (i) => i.key === getParam("assignedTo")
            )}
          />
          {groupsQuery.data && groupsQuery.data.total && (
            <AggiePagination
              size='sm'
              itemsPerPage={50}
              total={groupsQuery.data.total}
              goToPage={(num) => setParams({ page: num })}
            />
          )}
        </div>
      </nav>
      <div className='divide-y divide-slate-200 border border-slate-200 rounded-lg'>
        {groupsQuery.isSuccess &&
          groupsQuery.data?.results.map((groupItem) => (
            <Link
              to={"/group/" + groupItem._id}
              className={"group no-underline"}
              key={groupItem._id}
            >
              <IncidentListItem item={groupItem} />
            </Link>
          ))}
      </div>
    </section>
  );
};

export default Incidents;
