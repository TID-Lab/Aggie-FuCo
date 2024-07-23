import { Link } from "react-router-dom";
import { Group } from "../../objectTypes";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "../../api/tags";
import { VeracityOptions } from "../../objectTypes";

interface IProps {
  item: Group;
}

const VeracityColor: {
  [key in VeracityOptions]: string;
} = {
  Unconfirmed: "bg-slate-300",
  "Confirmed True": "bg-lime-300",
  "Confirmed False": "bg-red-300",
};

const IncidentListItem = ({ item }: IProps) => {
  const tagsQuery = useQuery(["tags"], getTags, { staleTime: 40000 });

  /// lol i should refactor this
  function renderTag(id: string) {
    if (tagsQuery.isSuccess && tagsQuery.data) {
      return tagsQuery.data.find((i) => i._id === id);
    }
    return undefined;
  }
  return (
    <article className='grid grid-cols-6 px-2 py-2 text-sm text-slate-500 '>
      <header className='col-span-3 flex flex-col'>
        <div className='flex gap-1 '>
          <span
            className={`text-slate-700 font-medium px-1 ${
              VeracityColor[item.veracity]
            }`}
          >
            {item.veracity}
          </span>
          {tagsQuery.isSuccess &&
            item.smtcTags &&
            item.smtcTags.map((id) => (
              <span className='bg-slate-200 font-medium px-2 text-slate-700 rounded-full'>
                {renderTag(id)?.name}
              </span>
            ))}
        </div>
        <h2 className='text-lg text-slate-700'>{item.title}</h2>
        <div className='grid grid-cols-4 flex-grow items-end'>
          <p>#{item.idnum}</p>
          <p>{item.locationName}</p>
          <p>{item.creator?.username}</p>
        </div>
      </header>
      <div className='col-span-2 '>
        <p className='px-2 py-1 bg-slate-100 h-[6em] overflow-y-auto border border-slate-200 rounded whitespace-pre-line'>
          {item.notes && item.notes}
        </p>
      </div>
      <footer className='col-span-1 text-end'>
        <div>
          <p className=''>Assigned to:</p>
          {item.assignedTo &&
            item.assignedTo.map((user) => (
              <p>
                <Link key={user._id} to={"/user/" + user._id}>
                  {user.username ? user.username : "Deleted user"}
                </Link>
              </p>
            ))}
        </div>
      </footer>
    </article>
  );
};

export default IncidentListItem;
