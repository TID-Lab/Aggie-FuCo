import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIncidentMutations } from "../useIncidentMutations";

import { addComment, getGroup, getGroupReports } from "../../../api/groups";
import { getSession } from "../../../api/session";
import { EditableGroupComment, Group } from "../../../api/groups/types";

import AxiosErrorCard from "../../../components/AxiosErrorCard";

import SocialMediaPost from "../../../components/SocialMediaPost";
import { Link } from "react-router-dom";
import AggieButton from "../../../components/AggieButton";
import DropdownMenu from "../../../components/DropdownMenu";
import PlaceholderDiv from "../../../components/PlaceholderDiv";

import { Dialog } from "@headlessui/react";
import CreateEditIncidentForm from "../CreateEditIncidentForm";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEllipsisH,
  faMinusCircle,
  faEdit,
  faMinus,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { faDotCircle } from "@fortawesome/free-regular-svg-icons";
import AggieSwitch from "../../../components/AggieSwitch";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";
import CommentTimeline from "./CommentTimeline";
import IncidentInfo from "./IncidentInfo";
import ReportFilters from "../../Reports/components/ReportsFilters";
import { useQueryParams } from "../../../hooks/useQueryParams";
import { Report, ReportQueryState } from "../../../api/reports/types";
import { useMultiSelect } from "../../../hooks/useMultiSelect";
import GroupReportListItem from "./GoupReportListItem";
import AggieCheck from "../../../components/AggieCheck";
import AggieDialog from "../../../components/AggieDialog";

const Incident = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();
  const { doUpdate, doSetEscalate, doSetClosed } = useIncidentMutations();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activePost, setActivePost] = useState<Report | undefined>();

  const queryData = useUpdateQueryData();
  const {
    isLoading,
    isError,
    data: group,
    error: groupError,
  } = useQuery(["group", id], () => getGroup(id), {
    onSuccess: (data) => {},
  });

  const { data: groupReports, refetch: groupRefetch } = useQuery(
    ["groups", "reports", { groupId: id }],
    () => getGroupReports({ ...getAllParams(), groupId: id })
  );

  const multiSelect = useMultiSelect({
    allItems: groupReports?.results,
    mapFn: (i) => i._id,
  });

  useEffect(() => {
    // refetch on filter change
    groupRefetch();
    multiSelect.set([]);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [searchParams]);

  if (isError) {
    return <AxiosErrorCard error={groupError} />;
  }
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-2 pt-6 gap-6 '>
      <main className='col-span-1 h-full mb-12 '>
        <div className='flex gap-1 h-min justify-between items-center'>
          <AggieButton
            variant='transparent'
            className='text-sm'
            onClick={() => navigate("/incidents")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Go Back
          </AggieButton>
          <div className='flex items-center gap-2'>
            {group && (
              <div className='flex justify-between items-center px-2 py-1 gap-2 font-medium text-sm bg-white rounded-lg border border-slate-300'>
                Escalate:
                <AggieSwitch
                  checked={group.escalated}
                  disabled={doSetEscalate.isLoading}
                  onChange={() =>
                    doSetEscalate.mutate(
                      {
                        ids: [group._id],
                        escalated: !group.escalated,
                      },
                      {
                        onSuccess: (_, params) => {
                          // update single report
                          if (!id) return;
                          queryData.update<Group>(["group", id], (data) => {
                            return {
                              escalated: params.escalated,
                            };
                          });
                        },
                      }
                    )
                  }
                />
              </div>
            )}

            <DropdownMenu
              variant='secondary'
              className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-300'
              panelClassName='overflow-hidden right-0'
              buttonElement={<FontAwesomeIcon icon={faEllipsisH} />}
            >
              <AggieButton
                className='w-full px-2 py-1 hover:bg-slate-200  font-medium flex gap-2 text-nowrap items-center flex-grow '
                onClick={() => setIsEditOpen(true)}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit Incident
              </AggieButton>
              {group?.closed ? (
                <AggieButton
                  className={`w-full px-2 py-1 hover:bg-green-100 text-green-700  font-medium flex gap-2 text-nowrap items-center flex-grow `}
                  onClick={() =>
                    doSetClosed.mutate(
                      {
                        ids: !!group?._id ? [group?._id] : [""],
                        closed: false,
                      },
                      {
                        onSuccess: (_, params) => {
                          // update single report
                          if (!id) return;

                          queryData.update<Group>(["group", id], (data) => {
                            return {
                              closed: params.closed,
                            };
                          });
                        },
                      }
                    )
                  }
                >
                  <FontAwesomeIcon icon={faDotCircle} />
                  Open Incident
                </AggieButton>
              ) : (
                <AggieButton
                  className={`w-full px-2 py-1 hover:bg-red-100 text-red-700  font-medium flex gap-2 text-nowrap items-center flex-grow `}
                  onClick={() =>
                    doSetClosed.mutate({
                      ids: !!group?._id ? [group?._id] : [""],
                      closed: true,
                    })
                  }
                >
                  <FontAwesomeIcon icon={faMinusCircle} />
                  Close Incident
                </AggieButton>
              )}
            </DropdownMenu>
          </div>
        </div>
        <IncidentInfo group={group} isLoading={isLoading} />

        <CommentTimeline group={group} isLoading={isLoading} />
      </main>
      <aside className='flex flex-col gap-1 h-[90vh] sticky top-0 px-4 '>
        <PlaceholderDiv
          as='h2'
          width='7em'
          loading={isLoading}
          className='text-xl font-medium'
        >
          <span className=''>({group?._reports.length})</span> reports attached
        </PlaceholderDiv>
        <ReportFilters
          reportCount={groupReports && groupReports.total}
          headerElement={
            multiSelect.isActive ? (
              <AggieButton
                variant='secondary'
                className='text-xs font-medium '
                onClick={() => multiSelect.toggleActive()}
              >
                Cancel Selection
              </AggieButton>
            ) : (
              <AggieCheck
                active={multiSelect.isActive}
                onClick={() => {
                  multiSelect.toggleActive();
                  multiSelect.addRemoveAll(groupReports?.results);
                }}
              />
            )
          }
        />
        <div
          className={`px-1 flex gap-2 text-xs font-medium items-center ${
            multiSelect.isActive ? "mt-2" : ""
          }`}
        >
          {multiSelect.isActive && (
            <>
              <AggieCheck
                active={multiSelect.any()}
                icon={!multiSelect.all() ? faMinus : undefined}
                onClick={() => multiSelect.addRemoveAll(groupReports?.results)}
              />
              <p>
                Mark {multiSelect.selection.length} report{"(s)"} as:
              </p>
            </>
          )}
        </div>
        <div className='overflow-y-auto flex flex-col rounded-lg bg-slate-50 border border-slate-300'>
          {groupReports && groupReports.total > 0 ? (
            groupReports.results.map((report) => (
              <div
                onClick={() => setActivePost(report)}
                className='cursor-pointer'
              >
                <GroupReportListItem
                  report={report}
                  isChecked={multiSelect.exists(report._id)}
                  isSelectMode={multiSelect.isActive}
                  onCheckChange={() => multiSelect.addRemove(report._id)}
                />
              </div>
            ))
          ) : (
            <div className='grid place-items-center py-8 border border-slate-300 bg-white rounded-lg'>
              <p className='font-medium text-center px-3'>No Reports Found</p>
            </div>
          )}
        </div>
        {activePost && (
          <section className='absolute inset-0'>
            <div
              className='absolute inset-0 bg-black/30'
              aria-hidden='true'
              onClick={() => setActivePost(undefined)}
            />
            <div className='absolute p-3 inset-0 h-full w-full overflow-y-auto  grid place-items-center'>
              <div className='p-3 bg-slate-50 rounded-xl border border-slate-300 shadow-md max-w-md'>
                <header className='flex justify-between items-center mb-2'>
                  <p></p>
                  <AggieButton
                    variant='secondary'
                    icon={faClose}
                    onClick={() => setActivePost(undefined)}
                  >
                    close
                  </AggieButton>
                </header>
                <SocialMediaPost report={activePost} />
              </div>
            </div>
          </section>
        )}
      </aside>
      <AggieDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        className='p-4 max-w-lg w-full'
      >
        <CreateEditIncidentForm
          group={group}
          onCancel={() => setIsEditOpen(false)}
          onSubmit={(values) =>
            doUpdate.mutate(
              { ...values, _id: group?._id },
              {
                onSuccess: () => {
                  setIsEditOpen(false);
                  queryClient.invalidateQueries(["group", id]);
                },
              }
            )
          }
          isLoading={doUpdate.isLoading}
        />
      </AggieDialog>
    </section>
  );
};

export default Incident;
