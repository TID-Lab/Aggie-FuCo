import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../../api/groups";
import { getSources } from "../../api/sources";
import { getTags } from "../../api/tags";
import { getUsers } from "../../api/users";
import IncidentListItem from "./incidentListItem";

const Incidents = () => {
  const groupsQuery = useQuery(["groups"], () => getGroups());
  const sourcesQuery = useQuery(["sources"], getSources);
  const tagsQuery = useQuery(["tags"], getTags);
  const usersQuery = useQuery(["users"], getUsers);

  return (
    <section className='max-w-screen-xl mx-auto px-2'>
      <header className='my-4'>
        <h1 className='text-3xl'>Incidents</h1>
      </header>
      <div className='divide-y divide-slate-200 border border-slate-200 rounded-lg'>
        {groupsQuery.isSuccess &&
          groupsQuery.data?.results.map((groupItem) => (
            <IncidentListItem item={groupItem} />
          ))}
      </div>
    </section>
  );
};

export default Incidents;
