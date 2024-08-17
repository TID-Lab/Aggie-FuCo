import { Link, useNavigate } from "react-router-dom";
import { Group, GroupEditableData, Groups } from "../../objectTypes";

import React, { useState } from "react";
import TagsList from "../../components/tag/TagsList";
import VeracityToken from "../../components/VeracityToken";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";

import {
  faClose,
  faEdit,
  faEllipsis,
  faPlus,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import AggieButton from "../../components/AggieButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteGroup, editGroup } from "../../api/groups";
import { getSession } from "../../api/session";
import ConfirmationModal from "../../components/ConfirmationModal";

interface IProps {
  item: Group;
}

const IncidentListItem = ({ item }: IProps) => {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const sessionQuery = useQuery(["session"], getSession);
  const queryClient = useQueryClient();

  const editGroupMutation = useMutation({
    mutationFn: editGroup,
    // onSuccess: (data) => {
    //   const oldData = queryClient.getQueryData<Groups>(["groups"]);
    //   if (!oldData) return;
    //   queryClient.setQueryData(["groups"], {
    //     ...oldData,
    //     results: oldData.results.map((i) => (i._id === data._id ? data : i)),
    //   });
    //   console.log(data);
    // },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["groups"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<Groups>(["groups"]);
      if (previousData) {
        // Optimistically update to the new value

        queryClient.setQueryData(["groups"], {
          ...previousData,
          results: previousData.results.map((i) =>
            i._id === newData._id
              ? {
                  ...newData,
                  assignedTo: sessionQuery.data,
                  creator: sessionQuery.data,
                }
              : i
          ),
        });
      }
      // Return a context with the previous and new todo
      return { previousData, newData };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, newTodo, context) => {
      if (!context) return;
      // @ts-ignore
      queryClient.setQueryData(["groups"], context.previousData);
    },
    // Always refetch after error or success:
    onSettled: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (data) => {
      const oldData = queryClient.getQueryData<Groups>(["groups"]);
      if (!oldData) return;
      queryClient.setQueryData(["groups"], {
        ...oldData,
        results: oldData.results.filter((i) => i._id !== item._id),
      });
    },
    // Always refetch after error or success:
    onSettled: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  function onUserClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/user/${id}`);
  }
  function onOptionsClick(e: React.MouseEvent) {
    e.stopPropagation();
  }
  function onAssignClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!sessionQuery.data) return;
    //TODO: refactor by changing update function in backend
    const edit: GroupEditableData = {
      assignedTo: [sessionQuery.data._id],
      title: item.title,
      notes: item.notes || "",
      veracity: item.veracity,
      closed: item.closed,
      locationName: item.locationName,
      public: item.public,
      escalated: item.escalated,
      _id: item._id,
    };
    editGroupMutation.mutate(edit);
  }

  return (
    <article className='grid grid-cols-4 lg:grid-cols-6 px-2 py-2 text-sm text-slate-500 group-hover:bg-slate-50 border-b border-slate-200'>
      <header className='col-span-3 flex flex-col'>
        <div className='flex gap-1 '>
          <VeracityToken value={item.veracity} />
          <TagsList values={item.smtcTags} />
        </div>
        <h2 className='text-lg text-slate-700 group-hover:text-blue-600 group-hover:underline'>
          {item.title}
        </h2>
        <div className='grid grid-cols-4 flex-grow items-end'>
          <p>#{item.idnum}</p>
          <p>{item._reports?.length} reports</p>
          <p>{item.locationName}</p>
          <p>{item.creator?.username}</p>
        </div>
      </header>
      <div className='hidden lg:block col-span-2 '>
        <p className='px-2 py-1 bg-slate-100 h-[6em] overflow-y-auto border border-slate-200 rounded whitespace-pre-line'>
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
                className='text-blue-600 hover:underline w-fit'
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
                <p className='px-2 py-1 hover:bg-slate-200 rounded font-medium flex gap-1 text-nowrap items-center flex-grow'>
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
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            deleteGroupMutation.mutate(item, {
              onSuccess: () => setIsDeleteOpen(false),
            });
          }}
          data={{ title: "Delete Incident?" }}
          disabled={deleteGroupMutation.isLoading}
          confirmButton={
            <span className='bg-red-700 text-white hover:bg-red-600 rounded-lg flex gap-1 items-center px-2 py-1'>
              <FontAwesomeIcon
                icon={deleteGroupMutation.isLoading ? faSpinner : faTrash}
                className={deleteGroupMutation.isLoading ? "animate-spin" : ""}
              />
              Delete
            </span>
          }
        >
          <div className='px-3 py-2'>
            <p>
              deleting:{" "}
              <span className='px-1 bg-slate-100 rounded font-medium'>
                {item?.title}
              </span>
            </p>
            <p>
              There are {item?._reports?.length} report(s) attached, which will
              be permanently removed.
            </p>
          </div>
        </ConfirmationModal>
      </footer>
    </article>
  );
};

export default IncidentListItem;
