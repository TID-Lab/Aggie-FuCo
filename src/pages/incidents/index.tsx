import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../../api/groups";

const Incidents = () => {
  const groupsQuery = useQuery(["groups"], () => getGroups());

  return <></>;
};

export default Incidents;
