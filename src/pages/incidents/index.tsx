import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "../../hooks/useQueryParams";
import _ from "lodash";

import { getGroups } from "../../api/groups";
import type { GroupSearchState } from "../../objectTypes";

import { Link } from "react-router-dom";
import IncidentsFilters from "./IncidentsFilters";
import IncidentListItem from "./IncidentListItem";
import AggiePagination from "../../components/AggiePagination";

const Incidents = () => {
  const { searchParams, getAllParams, setParams } =
    useQueryParams<GroupSearchState>();

  const groupsQuery = useQuery(["groups"], () => getGroups(getAllParams()));

  useEffect(() => {
    // refetch on filter change
    groupsQuery.refetch();
  }, [searchParams]);

  return (
    <section className='max-w-screen-xl mx-auto px-2'>
      <header className='my-4'>
        <h1 className='text-3xl'>Incidents</h1>
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
