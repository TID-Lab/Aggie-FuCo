import { faCheck, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  active: boolean;
  icon?: IconDefinition;
}

// ideally this should use the the html input element....
const AggieCheck = ({ onClick, active, icon }: IProps) => {
  return (
    <div
      className='pointer-events-auto cursor-pointer group -m-2 hover:bg-blue-300/25 rounded-lg p-2 '
      onClick={onClick}
    >
      <div
        className={`w-4 h-4 border border-slate-400 group-hover:border-slate-600 grid place-items-center rounded ${
          active ? "bg-blue-500 text-slate-50" : "bg-white"
        }`}
      >
        {active && <FontAwesomeIcon icon={!!icon ? icon : faCheck} size='xs' />}
      </div>
    </div>
  );
};

export default AggieCheck;
