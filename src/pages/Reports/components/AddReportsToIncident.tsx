import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryParamsInternal } from "../../../hooks/useQueryParamsInternal";

import { getGroups } from "../../../api/groups";
import { setReportsToGroup } from "../../../api/reports";
import type { Group } from "../../../api/groups/types";
import type { Report, Reports } from "../../../api/reports/types";

import { Dialog } from "@headlessui/react";
import AggieButton from "../../../components/AggieButton";

import SocialMediaPost from "../../../components/SocialMediaPost";

import NestedIncidentsList from "./NestedIncidentsList";
import IncidentsFilters from "../../incidents/IncidentsFilters";
import { GroupQueryState } from "../../../api/groups/types";
import { updateByIds } from "../../../utils/immutable";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";

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
  const queryData = useUpdateQueryData();

  const {
    searchParams,
    query,
    getAllParams,
    getParam,
    setParams,
    clearAllParams,
  } = useQueryParamsInternal<GroupQueryState>();

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

  const { data: incidents, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups(getAllParams()),
    enabled: isOpen && !!selection,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isOpen || !selection) return;
    refetch();
  }, [query]);

  const doAddReportToIncident = useMutation({
    mutationFn: setReportsToGroup,
    onSuccess: (_, params) => {
      onClose();
      // update reports list
      queryData.update<Reports>(queryKey, (previousData) => {
        const updateData = updateByIds(params.reportIds, previousData.results, {
          _group: params.groupId?._id,
        });
        return {
          results: updateData,
        };
      });
    },
  });

  function onAddIncident() {
    if (!selection || selection.length === 0 || !selectedIncident) return;
    doAddReportToIncident.mutate({
      reportIds: selection,
      groupId: selectedIncident,
    });
  }
  if (!isOpen) return <></>;
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <Dialog.Panel className='bg-gray-50 rounded-xl border border-slate-200 shadow-xl min-w-24 h-[90vh] min-h-12 p-3 grid grid-cols-2 gap-2 w-full	grid-rows-[auto_1fr]'>
          <div className='col-span-2 flex justify-between '>
            <div className='flex-1'>
              <AggieButton variant='secondary' onClick={onClose}>
                Cancel
              </AggieButton>
            </div>

            <p className='font-medium text-lg'>Add Reports to Incident</p>
            <div className='flex-1 flex justify-end'>
              <AggieButton
                variant='primary'
                onClick={onAddIncident}
                loading={doAddReportToIncident.isLoading}
                disabled={doAddReportToIncident.isLoading || !selectedIncident}
              >
                Add {selection ? `${selection.length}` : ""} report(s) to
                incident
              </AggieButton>
            </div>
          </div>

          <div className='overflow-y-auto flex flex-col gap-1 h-full'>
            <h2 className='font-medium text-lg mb-1'>Selected Reports:</h2>

            {ReportsFromSelection(selection, isOpen).map((report) => (
              <SocialMediaPost key={report._id} report={report} />
            ))}
          </div>

          <div className='flex flex-col h-full overflow-y-auto'>
            <h2 className='font-medium text-lg mb-1'>Select an Incident:</h2>

            <IncidentsFilters
              get={getParam}
              set={setParams}
              isQuery={!!searchParams.size}
              clearAll={clearAllParams}
              totalCount={incidents && incidents.total}
            />
            <div className='overflow-y-auto bg-white border border-slate-300 rounded-lg'>
              <NestedIncidentsList
                incidents={incidents}
                selectedIncident={selectedIncident}
                onIncidentClicked={(item) => setSelectedIncident(item)}
              />
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddReportsToIncidents;
