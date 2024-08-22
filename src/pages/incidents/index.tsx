import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "../../hooks/useQueryParams";
import _ from "lodash";

import { getGroups } from "../../api/groups";
import type { GroupQueryState } from "../../objectTypes";

import { Link } from "react-router-dom";
import IncidentsFilters from "./IncidentsFilters";
import IncidentListItem from "./IncidentListItem";
import AggiePagination from "../../components/AggiePagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Incidents = () => {
  const { searchParams, getAllParams, setParams } =
    useQueryParams<GroupQueryState>();

  const groupsQuery = useQuery(["groups"], () => getGroups(getAllParams()));

  useEffect(() => {
    // refetch on filter change
    groupsQuery.refetch();
  }, [searchParams]);

  return (
    <section className='max-w-screen-xl mx-auto px-4 pb-10'>
      <header className='my-4 flex justify-between items-center'>
        <h1 className='text-3xl font-medium'>Incidents</h1>
        <Link
          to='new'
          className='px-3 py-2 flex gap-2 items-center text-sm bg-green-800 hover:text-slate-100 hover:bg-green-700 text-slate-100 rounded-lg font-medium'
        >
          <FontAwesomeIcon icon={faPlus} /> Create New Incident
        </Link>
      </header>

      <IncidentsFilters
        reportCount={groupsQuery.data && groupsQuery.data.total}
      />
      <div className='divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white'>
        {groupsQuery.isSuccess &&
          groupsQuery.data?.results.map((groupItem) => (
            <Link
              to={"/incidents/" + groupItem._id}
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
