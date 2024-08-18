import { Link, useNavigate } from "react-router-dom";
import { Group } from "../../objectTypes";

import React from "react";
import TagsList from "../../components/tag/TagsList";
import VeracityToken from "../../components/VeracityToken";

interface IProps {
  item: Group;
}

const IncidentListItem = ({ item }: IProps) => {
  const navigate = useNavigate();

  function onUserClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/user/${id}`);
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
      <footer className='col-span-1 text-end flex flex-col items-end'>
        <p className=''>Assigned to:</p>
        {item.assignedTo ? (
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
          <button className='px-3 py-2 bg-slate-600 rounded text-slate-100'>
            +Assign Myself
          </button>
        )}
      </footer>
    </article>
  );
};

export default IncidentListItem;
