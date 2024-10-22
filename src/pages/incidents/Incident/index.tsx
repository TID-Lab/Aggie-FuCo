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
} from "@fortawesome/free-solid-svg-icons";
import { faDotCircle } from "@fortawesome/free-regular-svg-icons";
import AggieSwitch from "../../../components/AggieSwitch";
import { useUpdateQueryData } from "../../../hooks/useUpdateQueryData";
import CommentTimeline from "./CommentTimeline";
import IncidentInfo from "./IncidentInfo";
import ReportFilters from "../../Reports/components/ReportsFilters";
import { useQueryParams } from "../../../hooks/useQueryParams";
import { ReportQueryState } from "../../../api/reports/types";
import { useMultiSelect } from "../../../hooks/useMultiSelect";
import GroupReportListItem from "./GoupReportListItem";

const Incident = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  let { id } = useParams();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const { doUpdate, doSetEscalate, doSetClosed } = useIncidentMutations();
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
    () => getGroupReports(id, 0)
  );
  const multiSelect = useMultiSelect({
    allItems: groupReports?.results,
    mapFn: (i) => i._id,
  });
  const { searchParams, getAllParams, setParams, getParam } =
    useQueryParams<ReportQueryState>();
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
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-2 pt-6 gap-8 '>
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
      <aside className='overflow-y-auto flex flex-col gap-1 h-[90vh] sticky top-0'>
        <PlaceholderDiv
          as='h2'
          width='7em'
          loading={isLoading}
          className='text-xl font-medium'
        >
          <span className=''>({group?._reports.length})</span> reports attached
        </PlaceholderDiv>
        <ReportFilters />
        <div className='flex flex-col rounded-lg bg-slate-50 border border-slate-300'>
          {groupReports && groupReports.total > 0 ? (
            groupReports.results.map((report) => (
              <GroupReportListItem
                report={report}
                isChecked={multiSelect.exists(report._id)}
                isSelectMode={multiSelect.isActive}
                onCheckChange={() => multiSelect.addRemove(report._id)}
              />
            ))
          ) : (
            <div className='grid place-items-center py-8 border border-slate-300 bg-white rounded-lg'>
              <p className='font-medium text-center px-3'>
                No Reports Attached! head to the{" "}
                <Link to='/reports' className='underline text-blue-600'>
                  Reports Page
                </Link>{" "}
                to add relevant reports to this page
              </p>
            </div>
          )}
        </div>
      </aside>
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        className='relative z-50'
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-[30rem] min-h-12 p-4 flex flex-col gap-2'>
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
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default Incident;
