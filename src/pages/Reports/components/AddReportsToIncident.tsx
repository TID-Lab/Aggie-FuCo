import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGroups } from "../../../api/groups";
import { setReportsToGroup } from "../../../api/reports";
import type { Group } from "../../../objectTypes";
import type { Report, Reports } from "../../../api/reports/types";

import { Dialog } from "@headlessui/react";
import AggieButton from "../../../components/AggieButton";
import TagsList from "../../../components/tag/TagsList";
import IncidentListItem from "../../incidents/IncidentListItem";
import SocialMediaPost from "../../../components/SocialMediaPost";

interface IAddReportsToIncidents {
  isOpen: boolean;
  selection?: string[];
  queryKey: string[];
  onClose: () => void;
}
const AddReportsToIncidents = ({
  isOpen,
  selection,
  queryKey,
  onClose,
}: IAddReportsToIncidents) => {
  const [selectedIncident, setSelectedIncident] = useState<Group>();
  const queryClient = useQueryClient();

  function ReportsFromSelection(
    ids: string[] | undefined,
    openStatus: boolean
  ) {
    // dont run if window not open
    if (!openStatus) return [];
    if (!ids || ids.length === 0) return [];
    const data = queryClient.getQueryData<Reports>(queryKey);
    //TODO: nice error window
    if (!data) return [];
    const getReports = data?.results.filter((i) => ids.includes(i._id));
    if (!getReports) return [];
    return getReports;
  }
  const { data: incidents } = useQuery(["groups"], () => getGroups());

  const addReportsMutation = useMutation({
    mutationFn: setReportsToGroup,
    onSuccess: () => {
      onClose();
    },
  });

  function onAddIncident() {
    if (!selection || selection.length === 0 || !selectedIncident) return;
    addReportsMutation.mutate({
      reportIds: selection,
      groupId: selectedIncident,
    });
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-24 max-h-[90vh] min-h-12 p-3 grid grid-cols-2 gap-2'>
          <div className='col-span-2 flex justify-between'>
            <AggieButton
              className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-200'
              onClick={onClose}
            >
              Cancel
            </AggieButton>
            <p className='font-medium text-lg'>Attach Reports to Incident</p>
            <AggieButton
              variant='primary'
              onClick={onAddIncident}
              loading={addReportsMutation.isLoading}
              disabled={addReportsMutation.isLoading}
            >
              Attach to incident
            </AggieButton>
          </div>
          <div className='overflow-y-scroll max-h-[80vh] flex flex-col gap-1'>
            {ReportsFromSelection(selection, isOpen).map((report) => (
              <SocialMediaPost key={report._id} report={report} />
            ))}
          </div>
          <div className='overflow-y-scroll max-h-[80vh]'>
            <div className='flex flex-col gap-1 '>
              {incidents &&
                incidents.results.map((item) => (
                  <button
                    key={item._id}
                    className={`w-full text-left ${
                      selectedIncident?._id === item._id
                        ? "bg-blue-200"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedIncident(item)}
                  >
                    {/* <div className='flex justify-between mb-1'>
                      <p className='font-medium'>
                        {item.title} #{item.idnum}
                        <span className='ml-1 inline-flex gap-1 text-sm'>
                          <TagsList values={item.smtcTags} />
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className='px-2 py-1 bg-slate-100 h-[6em] overflow-y-auto border border-slate-200 rounded whitespace-pre-line'>
                        {item.notes && item.notes}
                      </p>
                    </div> */}
                    <IncidentListItem item={item} />
                  </button>
                ))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddReportsToIncidents;
