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
import ComboBox from "../../components/ComboBox";
import { useEffect } from "react";

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
  function usersToComboBox(query: typeof usersQuery) {
    if (!query.isSuccess || !query.data) return [];
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
          <p>All</p>
          <p>Unconfirmed</p>
          <p>Confirmed</p>
        </div>
        <div className='flex items-center gap-1'>
          <ComboBox
            label='Assignee'
            list={usersToComboBox(usersQuery)}
            onChange={(e) => {
              setParams({ assignedTo: e.key });
            }}
            selectedItem={usersToComboBox(usersQuery).find(
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
