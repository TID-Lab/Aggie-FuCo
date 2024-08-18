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
    <section className='max-w-screen-2xl mx-auto px-4 pb-10'>
      <header className='my-4 flex justify-between items-center'>
        <h1 className='text-3xl'>Incidents</h1>
        <button className='px-3 py-2 flex gap-2 items-center text-sm bg-green-800  text-slate-100 rounded-lg font-medium'>
          <FontAwesomeIcon icon={faPlus} /> Create New Incident
        </button>
      </header>

      {groupsQuery.data && groupsQuery.data.total && (
        <AggiePagination
          size='sm'
          itemsPerPage={50}
          total={groupsQuery.data.total}
          goToPage={(num) => setParams({ page: num })}
        />
      )}
      <IncidentsFilters />
      <div className='divide-y divide-slate-200 border border-slate-200 rounded-lg'>
        {groupsQuery.isSuccess &&
          groupsQuery.data?.results.map((groupItem) => (
            <Link
              to={"/incidents/id/" + groupItem._id}
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
