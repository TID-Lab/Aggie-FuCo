import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryParamsInternal } from "../../../hooks/useQueryParamsInternal";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";

import { getGroups } from "../../../api/groups";
import { setReportsToGroup } from "../../../api/reports";
import type { Group, GroupQueryState } from "../../../api/groups/types";
import type { Report, Reports } from "../../../api/reports/types";
import { updateByIds } from "../../../utils/immutable";

import { Dialog } from "@headlessui/react";
import AggieButton from "../../../components/AggieButton";

import SocialMediaPost from "../../../components/SocialMediaPost";

import NestedIncidentsList from "./NestedIncidentsList";
import IncidentsFilters from "../../incidents/IncidentsFilters";
import MultiSelectListItem from "../../../components/MultiSelectListItem";
import SocialMediaListItem from "../../../components/SocialMediaListItem";
import { useMultiSelect } from "../../../hooks/useMultiSelect";
import AggieCheck from "../../../components/AggieCheck";
import { faMinus } from "@fortawesome/free-solid-svg-icons";

interface IAddReportsToIncidents {
  isOpen: boolean;
  selection?: Report[];
  queryKey: any[];
  onSuccess?: () => void;
  onClose: () => void;
}
const AddReportsToIncidents = ({
  isOpen,
  selection,
  queryKey,
  onClose,
  onSuccess,
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

  const multiSelect = useMultiSelect({
    allItems: selection,
  });

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
      if (!!onSuccess) onSuccess();
    },
  });

  function onAddIncident() {
    if (!selection || selection.length === 0 || !selectedIncident) return;
    doAddReportToIncident.mutate({
      reportIds: selection.map((i) => i._id),
      groupId: selectedIncident,
    });
  }
  if (!isOpen) return <></>;
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <Dialog.Panel className='bg-gray-50 rounded-xl border border-slate-200 shadow-xl min-w-24 h-[90vh] min-h-12 p-3 grid grid-cols-2 gap-y-1 gap-x-4 w-full	grid-rows-[auto_1fr]'>
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
            <div className='flex gap-1 items-center'>
              <AggieCheck
                active={multiSelect.isActive}
                icon={!multiSelect.all() ? faMinus : undefined}
                onClick={() => {
                  if (multiSelect.isActive && multiSelect.any()) {
                    multiSelect.setActive(false);
                    multiSelect.set([]);
                  } else if (!multiSelect.isActive && !multiSelect.any()) {
                    multiSelect.setActive(true);
                    multiSelect.addRemoveAll(selection);
                  } else {
                    multiSelect.addRemoveAll(selection);
                  }
                }}
              />

              {multiSelect.isActive && (
                <>
                  <AggieButton
                    variant='secondary'
                    className='text-xs font-medium '
                    onClick={() => multiSelect.toggleActive()}
                  >
                    Cancel Selection
                  </AggieButton>
                </>
              )}
            </div>
            <div className='rounded-lg border overflow-x-hidden border-slate-300 overflow-y-auto'>
              {selection &&
                selection.map((report) => (
                  <MultiSelectListItem
                    isChecked={multiSelect.exists(report)}
                    isSelectMode={multiSelect.isActive}
                    onCheckChange={() => multiSelect.addRemove(report)}
                    key={report._id}
                  >
                    <div className='text-sm'>
                      <SocialMediaListItem report={report} />
                    </div>
                  </MultiSelectListItem>
                ))}
            </div>
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
