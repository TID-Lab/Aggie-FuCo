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
      <div className=' rounded-lg flex border border-slate-300 min-w-fit'>
        <AggieButton
          variant='light:amber'
          className='rounded-l-lg'
          disabled={disabled || setRead.isLoading}
          icon={faEnvelopeOpen}
          onClick={() =>
            setRead.mutate({
              reportIds: selection,
              read: true,
              currentPageId,
            })
          }
        >
          Read
        </AggieButton>
        <AggieButton
          variant='light:lime'
          className='rounded-r-lg'
          disabled={disabled || setRead.isLoading}
          icon={faEnvelope}
          onClick={() =>
            setRead.mutate({
              reportIds: selection,
              read: false,
              currentPageId,
            })
          }
        >
          Unread
        </AggieButton>
      </div>
      <div className='flex rounded-lg border border-slate-300'>
        <AggieButton
          variant='light:rose'
          className='rounded-l-lg'
          disabled={disabled || setIrrelevance.isLoading}
          icon={faXmark}
          onClick={() =>
            setIrrelevance.mutate({
              reportIds: selection,
              irrelevant: "true",
              currentPageId,
            })
          }
        >
          Not Relevant
        </AggieButton>
        <AggieButton
          variant='light:green'
          className='rounded-r-lg'
          disabled={disabled || setIrrelevance.isLoading}
          icon={faDotCircle}
          onClick={() =>
            setIrrelevance.mutate({
              reportIds: selection,
              irrelevant: "false",
              currentPageId,
            })
          }
        >
          Relevant
        </AggieButton>
      </div>

      <div className='flex font-medium'>
        <AggieButton
          className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-300 hover:bg-slate-200'
          onClick={() => setAddReportModal(true)}
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add to Incident
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
