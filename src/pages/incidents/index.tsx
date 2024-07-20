import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../../api/groups";
import { getSources } from "../../api/sources";
import { getTags } from "../../api/tags";
import { getUsers } from "../../api/users";

const Incidents = () => {
  const groupsQuery = useQuery(["groups"], () => getGroups());
  const sourcesQuery = useQuery(["sources"], getSources);
  const tagsQuery = useQuery(["tags"], getTags);
  const usersQuery = useQuery(["users"], getUsers);
  return <></>;
};

export default Incidents;
