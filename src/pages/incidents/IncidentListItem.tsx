import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticMutation } from "../../hooks/useOptimisticMutation";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";

import { deleteGroup, editGroup } from "../../api/groups";
import { getSession } from "../../api/session";
import type { Group, Groups } from "../../objectTypes";
import { updateByIds } from "../../utils/immutable";

import TagsList from "../../components/tag/TagsList";
import VeracityToken from "../../components/VeracityToken";
import { Dialog, Menu } from "@headlessui/react";
import AggieButton from "../../components/AggieButton";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import IncidentForm from "./IncidentForm";

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
  function setEditData(data: Group) {
    const assignId = data.assignedTo ? data.assignedTo.map((i) => i._id) : [];
    return {
      groupName: data.title,
      groupVeracity: data.veracity,
      groupClosed: data.closed,
      groupEscalated: data.escalated,
      groupLocation: data.locationName,
      groupAssignedTo: assignId,
      groupNotes: data.notes || "",
    };
  }

  return (
    <article className='grid grid-cols-4 lg:grid-cols-6 px-2 py-2 text-sm text-slate-500  group-hover:bg-slate-50 border-b border-slate-200'>
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
        </ConfirmationDialog>
      </footer>
      <Dialog
        open={isEditOpen}
        onClose={() => console.log()}
        className='relative z-50'
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-[30rem] min-h-12 p-4 flex flex-col gap-2'>
              <IncidentForm
                initialValues={setEditData(item)}
                onCancel={() => setIsEditOpen(false)}
                onSubmit={(values) =>
                  editGroupMutation.mutate({ ...values, _id: item._id })
                }
                isLoading={editGroupMutation.isLoading}
              />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </article>
  );
};

export default IncidentListItem;
