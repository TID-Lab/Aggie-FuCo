import UserProfileTable from "../../components/user/UserProfileTable";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../api/users";
import { useNavigate, useParams } from "react-router-dom";
import { Groups, Session, Source, Tag } from "../../objectTypes";
import { compareIds } from "../../helpers";

interface IProps {
  session: Session | undefined;
}

const UserProfile = (props: IProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const usersQuery = useQuery(["user", params.id], () => {
    if (params.id) return getUser(params.id);
    else return undefined;
  });

  return (
    <section className={"mt-4 max-w-screen-xl mx-auto"}>
      {usersQuery.isSuccess && props.session && (
        <UserProfileTable
          user={usersQuery.data}
          isCurrentUser={compareIds(usersQuery.data, props.session)}
        />
      )}
    </section>
  );
};

export default UserProfile;
