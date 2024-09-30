import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticMutation } from "../../hooks/useOptimisticMutation";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";

import { deleteGroup, editGroup } from "../../api/groups";
import { getSession } from "../../api/session";
import type { Group, Groups } from "../../api/groups/types";
import { updateByIds } from "../../utils/immutable";

import TagsList from "../../components/Tags/TagsList";
import VeracityToken from "../../components/VeracityToken";
import { Dialog, Menu } from "@headlessui/react";
import AggieButton from "../../components/AggieButton";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import IncidentForm from "./IncidentForm_old";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faEllipsis,
  faMinusCircle,
  faPlus,
  faSpinner,
  faTrash,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import AggieDialog from "../../components/AggieDialog";
import CreateEditIncidentForm from "./CreateEditIncidentForm";

interface IProps {
  item: Group;
}
//TODO: refactor

const IncidentListItem = ({ item }: IProps) => {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const sessionQuery = useQuery(["session"], getSession);
  const queryData = useUpdateQueryData();

  const editAssignMutation = useOptimisticMutation({
    queryKey: ["groups"],
    mutationFn: editGroup,
    setQueryData: (previousData: Groups) => {
      if (!sessionQuery.data) return previousData;
      const user = {
        username: sessionQuery.data.username,
        _id: sessionQuery.data._id,
      };
      return {
        ...previousData,
        results: updateByIds([item._id], previousData.results, {
          assignedTo: [user],
          creator: user,
        }),
      };
    },
  });

  const editGroupMutation = useMutation({
    mutationFn: editGroup,
    onSuccess: (_, variables) => {
      queryData.update<Groups>(["groups"], (data) => {
        return {
          results: updateByIds([item._id], data.results, {
            ...variables,
          }),
        };
      });

      setIsEditOpen(false);
    },
    onSettled: (newTodo) => {
      queryData.queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_) => {
      queryData.update<Groups>(["groups"], (data) => {
        return {
          results: data.results.filter((i) => i._id !== item._id),
        };
      });
    },
    onSettled: (newTodo) => {
      queryData.queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  function onUserClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/settings/user/${id}`);
  }
  function onOptionsClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  // lol.
  function onAssignClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!sessionQuery.data) return;

    editAssignMutation.mutate({
      assignedTo: [sessionQuery.data._id],
      title: item.title,
      notes: item.notes || "",
      veracity: item.veracity,
      closed: item.closed,
      locationName: item.locationName,
      public: item.public,
      escalated: item.escalated,
      _id: item._id,
    });
  }

  return (
    <article className='grid grid-cols-4 lg:grid-cols-6 p-3 text-sm text-slate-500 group-hover:bg-slate-50 border-b border-slate-300'>
      <header className='col-span-3 flex flex-col'>
        <div className='flex gap-1 '>
          <VeracityToken value={item.veracity} />
          {item.closed && (
            <span className='px-1 bg-purple-200 text-purple-700 font-medium flex gap-1 items-center'>
              <FontAwesomeIcon icon={faMinusCircle} />
              Closed
            </span>
          )}
          <TagsList values={item.smtcTags} />
        </div>
        <h2 className=' text-slate-700 flex gap-2 items-center font-medium'>
          <span className='text-lg group-hover:text-blue-600 group-hover:underline'>
            {item.title}
          </span>
          {item.escalated && (
            <span className='px-1 bg-orange-700 text-white font-medium text-sm flex gap-1 items-center no-underline'>
              <FontAwesomeIcon icon={faWarning} />
              Escalated
            </span>
          )}
        </h2>
        <div className='grid grid-cols-4 flex-grow items-end font-medium'>
          <p>#{item.idnum}</p>
          <p>{item._reports?.length} reports</p>
          <p>{item.locationName}</p>
          <p>{item.creator?.username}</p>
        </div>
      </header>
      <div className='hidden lg:block col-span-2 '>
        <p className='px-2 py-1 text-slate-700 bg-slate-100 h-[6em] overflow-y-auto border border-slate-200 rounded whitespace-pre-line'>
          {item.notes && item.notes}
        </p>
      </div>
      <footer className='col-span-1 flex justify-end gap-2 '>
        <div className='text-end flex flex-col items-end '>
          <p className=''>
            {item.assignedTo && item.assignedTo.length > 0
              ? "Assigned To:"
              : "Not Assigned"}
          </p>
          {item.assignedTo && item.assignedTo.length > 0 ? (
            item.assignedTo.map((user) => (
              <p
                key={user._id}
                onClick={(e) => onUserClick(e, user._id)}
                className='text-blue-600 hover:underline w-fit font-medium'
              >
                {user.username ? user.username : "Deleted user"}
              </p>
            ))
          ) : (
            <AggieButton
              className='px-2 py-1 bg-slate-600 rounded text-slate-100 hover:bg-slate-500 mt-1'
              disabled={!sessionQuery.data}
              onClick={onAssignClick}
            >
              <FontAwesomeIcon icon={faPlus} size='sm' />
              Assign Myself
            </AggieButton>
          )}
        </div>

        <Menu
          as='div'
          className='relative '
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Menu.Button
            className='px-2 py-1 hover:bg-slate-200 rounded h-full z-0'
            onClick={onOptionsClick}
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </Menu.Button>
          <Menu.Items
            className='absolute top-0 bottom-0 right-0 bg-white rounded-lg border border-slate-200 z-10 shadow-md flex divide-x divide-slate-200'
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className='p-1 pr-2 flex flex-col'>
              <Menu.Item>
                <p
                  className='px-2 py-1 hover:bg-slate-200 rounded font-medium flex gap-1 text-nowrap items-center flex-grow'
                  onClick={() => setIsEditOpen(true)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Incident
                </p>
              </Menu.Item>
              <Menu.Item>
                <p
                  className='px-2 py-1 hover:bg-red-200 rounded font-medium flex gap-1 text-nowrap items-center text-red-800'
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete Incident
                </p>
              </Menu.Item>
            </div>
            <div className=''>
              <Menu.Item>
                <div className='px-3 bg-slate-100 hover:bg-slate-200  h-full pointer-events-auto flex flex-col justify-center'>
                  <FontAwesomeIcon icon={faClose} />
                </div>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>

        <ConfirmationDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() =>
            deleteGroupMutation.mutate(item, {
              onSuccess: () => setIsDeleteOpen(false),
            })
          }
          disabled={deleteGroupMutation.isLoading}
          loading={deleteGroupMutation.isLoading}
          title={`'Delete incident ${item?.title} ?`}
          variant='danger'
          description='Are you sure you want to log out of this account?'
          className='max-w-md w-full'
          confirmText={"Logout"}
        >
          <p>
            There are {item?._reports?.length} report(s) attached, which will be
            permanently removed.
          </p>
        </ConfirmationDialog>
      </footer>
      <AggieDialog
        isOpen={isEditOpen}
        onClose={() => console.log()}
        className='px-3 py-4 w-full max-w-lg'
        data={{
          title: `Edit Incident`,
        }}
      >
        <CreateEditIncidentForm
          group={item}
          onCancel={() => setIsEditOpen(false)}
          onSubmit={(values) =>
            editGroupMutation.mutate({ ...values, _id: item._id })
          }
          isLoading={editGroupMutation.isLoading}
        />
      </AggieDialog>
    </article>
  );
};

export default IncidentListItem;
