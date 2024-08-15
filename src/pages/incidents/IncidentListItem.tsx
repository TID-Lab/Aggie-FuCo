import { Link, useNavigate } from "react-router-dom";
import { Group, GroupEditableData } from "../../objectTypes";

import React from "react";
import TagsList from "../../components/tag/TagsList";
import VeracityToken from "../../components/VeracityToken";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faListDots,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AggieButton from "../../components/AggieButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { editGroup } from "../../api/groups";
import { getSession } from "../../api/session";

interface IProps {
  item: Group;
}

const IncidentListItem = ({ item }: IProps) => {
  const navigate = useNavigate();

  const sessionQuery = useQuery(["session"], getSession);

  const editGroupMutation = useMutation({
    mutationFn: editGroup,
    onSuccess: () => {},
  });

  function onUserClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/user/${id}`);
  }
  function onOptionsClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
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
      <footer className='col-span-1 flex justify-end gap-1'>
        <div className='text-end flex flex-col items-end'>
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
        <AggieButton
          className='px-2 py-1 hover:bg-slate-200 rounded'
          onClick={onOptionsClick}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </AggieButton>
      </footer>
    </article>
  );
};

export default IncidentListItem;
