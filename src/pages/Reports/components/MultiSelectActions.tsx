import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReportMutations } from "../useReportMutations";

import AggieButton from "../../../components/AggieButton";
import DropdownMenu from "../../../components/DropdownMenu";
import AddReportsToIncidents from "./AddReportsToIncident";

import {
  faEnvelopeOpen,
  faEnvelope,
  faXmark,
  faDotCircle,
  faPlus,
  faCaretDown,
  faFile,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  disabled: boolean;
  selection: string[];
  currentPageId: string | undefined;
  queryKey: string[];
}

const MultiSelectActions = ({
  disabled,
  selection,
  currentPageId,
  queryKey,
}: IProps) => {
  const { setRead, setIrrelevance } = useReportMutations({ key: queryKey });
  const navigate = useNavigate();
  const [addReportModal, setAddReportModal] = useState(false);

  function onNewIncidentFromReports() {
    const params = new URLSearchParams({
      reports: selection.join(":"),
    });

    navigate({ pathname: "/incidents/new", search: params.toString() });
  }

  return (
    <>
      <div className=' rounded-lg flex overflow-hidden min-w-fit'>
        <AggieButton
          className='py-1 px-2 hover:bg-lime-200 bg-lime-100 text-lime-800'
          disabled={disabled || setRead.isLoading}
          onClick={() =>
            setRead.mutate({
              reportIds: selection,
              read: true,
              currentPageId,
            })
          }
        >
          <FontAwesomeIcon icon={faEnvelopeOpen} />
          Read
        </AggieButton>
        <AggieButton
          className='py-1 px-2 hover:bg-amber-200 bg-amber-100 text-amber-800'
          disabled={disabled || setRead.isLoading}
          onClick={() =>
            setRead.mutate({
              reportIds: selection,
              read: false,
              currentPageId,
            })
          }
        >
          <FontAwesomeIcon icon={faEnvelope} />
          Unread
        </AggieButton>
      </div>
      <div className='flex'>
        <AggieButton
          className='bg-rose-200 text-rose-800 border border-rose-500 border-none  px-2 py-1 rounded-l-lg hover:bg-rose-300'
          disabled={disabled || setIrrelevance.isLoading}
          onClick={() =>
            setIrrelevance.mutate({
              reportIds: selection,
              irrelevant: "true",
              currentPageId,
            })
          }
        >
          <FontAwesomeIcon icon={faXmark} />
          Not Relevant
        </AggieButton>
        <AggieButton
          className='bg-green-100 text-green-800 border border-green-200 border-none  px-2 py-1 rounded-r-lg hover:bg-green-300'
          disabled={disabled || setIrrelevance.isLoading}
          onClick={() =>
            setIrrelevance.mutate({
              reportIds: selection,
              irrelevant: "false",
              currentPageId,
            })
          }
        >
          <FontAwesomeIcon icon={faDotCircle} />
          Relevant
        </AggieButton>
      </div>

      <div className='flex font-medium'>
        <AggieButton
          className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
          onClick={() => setAddReportModal(true)}
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faPlus} />
          Attach Incident
        </AggieButton>
        <DropdownMenu
          variant='secondary'
          buttonElement={
            <FontAwesomeIcon
              icon={faCaretDown}
              className='ui-open:rotate-180'
            />
          }
          className='px-2 py-1 rounded-r-lg border-y border-r'
          panelClassName='right-0'
          disabled={disabled}
        >
          <AggieButton
            className='px-3 py-2 hover:bg-slate-200'
            onClick={onNewIncidentFromReports}
          >
            <FontAwesomeIcon icon={faFile} />
            Create New Incident with Report
          </AggieButton>
        </DropdownMenu>
      </div>
      {(setIrrelevance.isLoading || setRead.isLoading) && (
        <FontAwesomeIcon
          className='text-slate-600 animate-spin'
          icon={faSpinner}
        />
      )}
      <AddReportsToIncidents
        selection={selection}
        queryKey={queryKey}
        isOpen={addReportModal}
        onClose={() => {
          setAddReportModal(false);
        }}
      />
    </>
  );
};

export default MultiSelectActions;
