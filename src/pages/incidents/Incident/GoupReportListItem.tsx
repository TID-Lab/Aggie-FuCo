import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Report } from "../../../api/reports/types";
import AggieCheck from "../../../components/AggieCheck";
import SocialMediaListItem from "../../../components/SocialMediaListItem";

interface IProps {
  report: Report;
  isChecked: boolean;
  isSelectMode: boolean;
  onCheckChange: () => void;
}

const GroupReportListItem = ({
  report,
  isChecked,
  isSelectMode,
  onCheckChange,
}: IProps) => {
  function onChange(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    onCheckChange();
  }
  // refactor at some point
  function bgState() {
    if (isChecked && !isSelectMode)
      return "border-2 border-slate-300 bg-slate-100 rounded-lg ";
    else if (isChecked && isSelectMode) return "bg-blue-100 ";
    else if (report.read) return "bg-slate-50 hover:bg-slate-100 ";
    return "bg-white hover:bg-slate-100";
  }
  return (
    <article
      className={`px-2 py-3 pb-4 border-b border-slate-300 ${bgState()} relative group`}
    >
      <div
        className={`col-span-4 pl-7  ${
          report.read ? "" : " border-l-2 border-blue-600 "
        }`}
      >
        {isSelectMode ? (
          <div
            className='flex items-center absolute top-0 bottom-0 left-0 w-12 pointer-events-none '
            onClick={onChange}
          >
            <div className='w-full h-full pointer-events-auto cursor-pointer group hover:bg-blue-200/25 rounded p-2 pl-3 '>
              <div
                className={`w-4 h-4  border border-slate-500  group-hover:border-slate-600 grid place-items-center rounded ${
                  isChecked ? "bg-blue-500 text-slate-50" : "bg-white"
                }`}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size='xs' />}
              </div>
            </div>
            <div className='absolute ml-8 pointer-events-none h-full my-3 border-r border-slate-300'></div>
          </div>
        ) : (
          <div className='opacity-0 group-hover:opacity-100 flex items-center absolute top-0 left-0 pointer-events-none p-2 pl-3 '>
            <AggieCheck active={isChecked} onClick={onChange} />
          </div>
        )}
        <SocialMediaListItem report={report} />
      </div>
    </article>
  );
};

export default GroupReportListItem;
