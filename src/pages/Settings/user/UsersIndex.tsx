import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUsers } from "../../../api/users";
import { useState } from "react";
import { Link } from "react-router-dom";

import AggieButton from "../../../components/AggieButton";
import DropdownMenu from "../../../components/DropdownMenu";
import CreateEditUser from "./CreateEditUser";
import AggieDialog from "../../../components/AggieDialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEllipsisH,
  faPlusCircle,
  faRefresh,
  faShield,
  faTrash,
  faTrashAlt,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { Session } from "../../../api/session/types";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import SetPassword from "./SetPassword";

interface IProps {
  session?: Session;
}

const UsersIndex = ({ session }: IProps) => {
  const queryClient = useQueryClient();
  const { data, isSuccess } = useQuery(["users"], getUsers);
  const [editUser, setEditUser] = useState("");
  const [removeUser, setRemoveUser] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const doDeleteUser = useMutation(deleteUser, {
    onSuccess: () => {
      setRemoveUser("");
    },
  });

  function userFromId(id: string) {
    if (id === "newUser") return undefined;
    return data?.find((i) => i._id === id);
  }

  const userToDelete = userFromId(removeUser);

  return (
    <div className='w-full mb-16'>
      <div className='flex justify-between items-center'>
        <h3 className={"mb-3 font-medium text-3xl  my-3"}>Users</h3>

        <AggieButton
          variant='primary'
          padding='px-3 py-2'
          onClick={() => setEditUser("newUser")}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
          Create New User
        </AggieButton>
      </div>

      <div className=' rounded-lg border border-slate-300 bg-white divide-y divide-slate-300'>
        <div className='grid grid-cols-4 px-3 py-3 font-medium text-sm border-b border-slate-300 items-baseline'>
          <p>Username</p>
          <p>Role</p>
          <p>Email</p>
          <div className='flex justify-end '></div>
        </div>
        {!!data ? (
          data.map((user) => (
            <article
              key={user._id}
              className='grid grid-cols-4 px-3 py-3 items-center'
            >
              <p className='font-medium  text-blue-600 '>
                <Link
                  to={"/settings/user/" + user._id}
                  className=' hover:underline'
                >
                  {user.username}
                </Link>
              </p>
              <p className='px-2 py-1 bg-slate-200 rounded text-sm w-fit font-medium'>
                {user.role}
              </p>
              <p>{user.email}</p>
              <div className='flex justify-end'>
                {session?.role === "admin" && (
                  <DropdownMenu
                    variant='secondary'
                    className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-300'
                    panelClassName='overflow-hidden right-0 text-sm'
                    buttonElement={<FontAwesomeIcon icon={faEllipsisH} />}
                  >
                    <AggieButton
                      className='px-3 py-2 hover:bg-slate-100 text-slate-600 w-full'
                      onClick={() => setEditUser(user._id)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </AggieButton>
                    <AggieButton
                      className='px-3 py-2 hover:bg-slate-100 text-slate-600 w-full'
                      onClick={() => setEditPassword(user._id)}
                    >
                      <FontAwesomeIcon icon={faUserShield} />
                      Change Password
                    </AggieButton>
                    <AggieButton
                      className='px-3 py-2 hover:bg-slate-100 text-red-600'
                      onClick={() => setRemoveUser(user._id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                      Permanently Delete
                    </AggieButton>
                  </DropdownMenu>
                )}
              </div>
            </article>
          ))
        ) : (
          <article className='grid py-6 font-medium w-full place-items-center'>
            <p className=''>
              <FontAwesomeIcon
                icon={faRefresh}
                className='animate-spin text-slate-600'
              />{" "}
              Loading
            </p>
          </article>
        )}
      </div>
      <AggieDialog
        isOpen={!!editUser}
        onClose={() => setEditUser("")}
        className='px-3 py-4 w-full max-w-lg'
        data={{
          title: editUser === "newUser" ? "Create User" : "Edit user details",
        }}
      >
        <CreateEditUser
          user={userFromId(editUser)}
          onClose={() => setEditUser("")}
        />
      </AggieDialog>
      <AggieDialog
        isOpen={!!editPassword}
        onClose={() => setEditPassword("")}
        className='px-3 py-4 w-full max-w-lg'
        data={{
          title: `Change password for: ${userFromId(editPassword)?.username}`,
        }}
      >
        <SetPassword
          user={userFromId(editPassword)}
          onClose={() => setEditPassword("")}
        />
      </AggieDialog>

      <ConfirmationDialog
        isOpen={!!removeUser}
        variant='danger'
        disabled={doDeleteUser.isLoading}
        title={`Delete ${userToDelete?.username}'s Account Permanently?`}
        confirmText={"Delete"}
        onClose={() => setRemoveUser("")}
        onConfirm={() => !!userToDelete && doDeleteUser.mutate(userToDelete)}
      ></ConfirmationDialog>
    </div>
  );
};

export default UsersIndex;
