import { faMinusCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { Groups, Group } from "../../../api/groups/types";
import TagsList from "../../../components/Tags/TagsList";
import VeracityToken from "../../../components/VeracityToken";

interface IProps {
  incidents?: Groups;
  selectedIncident?: Group;
  onIncidentClicked: (item: Group) => void;
}

const NestedIncidentsList = ({
  incidents,
  selectedIncident,
  onIncidentClicked,
}: IProps) => {
  const navigate = useNavigate();

  function onUserClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    navigate({ pathname: `/settings/user/${id}` });
  }

  return (
    <>
      {incidents &&
        incidents.results.map((item) => (
          <button
            key={item._id}
            className={`w-full text-left ${
              selectedIncident?._id === item._id
                ? "bg-blue-200"
                : "hover:bg-slate-50"
            }`}
            onClick={() => onIncidentClicked(item)}
          >
            <article className='grid grid-cols-4 lg:grid-cols-6 px-2 py-2 text-sm text-slate-500  group-hover:bg-slate-50 border-b border-slate-200'>
              <header className='col-span-3 flex flex-col'>
                <div className='flex gap-1 text-xs'>
                  <VeracityToken value={item.veracity} />
                  {item.closed && (
                    <span className='px-1 bg-purple-200 text-purple-700 font-medium flex gap-1 items-center'>
                      <FontAwesomeIcon icon={faMinusCircle} />
                      Closed
                    </span>
                  )}
                  <TagsList values={item.smtcTags} />
                </div>
                <h2 className=' text-slate-700 gap-2 items-center font-medium'>
                  <span className='text-base group-hover:text-blue-600 group-hover:underline'>
                    {item.title}
                  </span>
                  {item.escalated && (
                    <span className='px-1 bg-orange-700 w-fit ml-1 text-white font-medium text-xs inline-flex gap-1 items-center no-underline'>
                      <FontAwesomeIcon icon={faWarning} />
                      Escalated
                    </span>
                  )}
                </h2>
                <div className='grid grid-cols-4 flex-grow items-end text-xs font-medium'>
                  <p>#{item.idnum}</p>
                  <p>{item._reports?.length} reports</p>
                  <p>{item.locationName}</p>
                  <p>{item.creator?.username}</p>
                </div>
              </header>
              <div className='hidden lg:block col-span-2 text-xs '>
                <p className='px-2 py-1 bg-slate-100 h-[6em] overflow-y-auto border border-slate-200 rounded whitespace-pre-line'>
                  {item.notes && item.notes}
                </p>
              </div>
              <footer className='col-span-1 flex justify-end gap-2 '>
                <div className='text-end flex flex-col items-end text-xs'>
                  <p className=''>
                    {item.assignedTo && item.assignedTo.length > 0
                      ? "Assigned To:"
                      : "Not Assigned"}
                  </p>
                  {item.assignedTo &&
                    item.assignedTo.length > 0 &&
                    item.assignedTo.map((user) => (
                      <p
                        key={user._id}
                        onClick={(e) => onUserClick(e, user._id)}
                        className='text-blue-600 hover:underline w-fit font-medium'
                      >
                        {user.username ? user.username : "Deleted user"}
                      </p>
                    ))}
                </div>
              </footer>
            </article>
          </button>
        ))}
    </>
  );
};

export default NestedIncidentsList;
