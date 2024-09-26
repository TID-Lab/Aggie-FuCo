import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  addComment,
  getGroup,
  getGroupReports,
  removeComment,
} from "../../../api/groups";

import AxiosErrorCard from "../../../components/AxiosErrorCard";
import TagsList from "../../../components/tag/TagsList";
import VeracityToken from "../../../components/VeracityToken";
import SocialMediaPost from "../../../components/SocialMediaPost";
import { Link } from "react-router-dom";
import AggieButton from "../../../components/AggieButton";
import DropdownMenu from "../../../components/DropdownMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleDot,
  faEdit,
  faEllipsisH,
  faMinusCircle,
  faTrashAlt,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import PlaceholderDiv from "../../../components/PlaceholderDiv";
import { faDotCircle } from "@fortawesome/free-regular-svg-icons";
import { Form, Formik, Field } from "formik";
import { EditableGroupComment, GroupComment } from "../../../api/groups/types";
import { getSession } from "../../../api/session";
import { useEffect, useState } from "react";
import UserToken from "../../../components/UserToken";
import Comment from "./Comment";
import { Dialog } from "@headlessui/react";
import IncidentForm from "../IncidentForm_old";
import { useIncidentMutations } from "../useIncidentMutations";
import { group } from "console";
const Incident = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  let { id } = useParams();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const { update } = useIncidentMutations();

  const {
    isLoading,
    isError,
    data: groupData,
    error: groupError,
  } = useQuery(["group", id], () => getGroup(id), {
    onSuccess: (data) => {
      console.log(data?.comments);
    },
  });
  const { data: groupReports, refetch: refetchGroup } = useQuery(
    ["reports", { groupId: id }],
    () => getGroupReports(id, 0)
  );
  const { data: session } = useQuery(["session"], getSession, {
    staleTime: 50000,
  });
  // TODO: refactor into its own component or something
  // if (isLoading) {
  //   return <span>Loading...</span>;
  // }

  const postNewComment = useMutation(addComment);

  function onPostAdd(formData: { commentdata: string }, resetForm: () => void) {
    if (!session || !id) return false;
    const post: EditableGroupComment = {
      data: formData.commentdata,
      author: session._id,
    };
    console.log(formData.commentdata);
    postNewComment.mutate(
      { groupId: id, comment: post },
      {
        onSuccess: () => {
          resetForm();
          queryClient.invalidateQueries(["group", id]);
        },
      }
    );
  }

  if (isError) {
    return <AxiosErrorCard error={groupError} />;
  }
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-2 pt-6 gap-8 h-full '>
      <main className='col-span-1 h-full mb-12'>
        <AggieButton
          variant='transparent'
          className='text-sm'
          onClick={() => navigate("/incidents")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Go Back
        </AggieButton>
        <header className='text-slate-600 border-b border-slate-300 py-2'>
          <div className='flex justify-between'>
            <div>
              <div className='flex gap-1 flex-wrap'>
                <VeracityToken value={groupData?.veracity} />
                {groupData?.closed && (
                  <span className='px-1 bg-purple-200 text-purple-700 font-medium inline-flex gap-1 items-center'>
                    <FontAwesomeIcon icon={faMinusCircle} />
                    Closed
                  </span>
                )}
                <TagsList values={groupData?.smtcTags} />
              </div>
              <PlaceholderDiv
                loading={isLoading}
                className='text-black text-3xl font-medium my-2'
                loadingClass='mt-1 bg-slate-200 rounded-lg'
                width='12em'
              >
                <h1>
                  {groupData?.title}{" "}
                  {groupData?.escalated && (
                    <span className='px-1 bg-orange-700 text-white font-medium text-base inline-flex gap-1 items-center no-underline'>
                      <FontAwesomeIcon icon={faWarning} />
                      Escalated
                    </span>
                  )}
                </h1>
              </PlaceholderDiv>
            </div>

            <div className='flex gap-1 h-min'>
              <AggieButton
                variant='secondary'
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </AggieButton>
              <DropdownMenu
                variant='secondary'
                className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-300'
                panelClassName='overflow-hidden right-0'
                buttonElement={<FontAwesomeIcon icon={faEllipsisH} />}
              >
                <AggieButton className='px-3 py-2 hover:bg-slate-100  text-red-600'>
                  <FontAwesomeIcon icon={faTrashAlt} />
                  Permanently Delete
                </AggieButton>
              </DropdownMenu>
            </div>
          </div>
          <div className='flex gap-12 my-2'>
            <PlaceholderDiv as='p' width='7em' loading={isLoading}>
              Id #{groupData?.idnum}
            </PlaceholderDiv>
            <PlaceholderDiv as='p' width='7em' loading={isLoading}>
              <span className='font-medium'>{groupData?._reports.length}</span>{" "}
              reports attached
            </PlaceholderDiv>
            <PlaceholderDiv as='p' width='7em' loading={isLoading}>
              located at{" "}
              <span className='font-medium'>{groupData?.locationName}</span>
            </PlaceholderDiv>
            <PlaceholderDiv as='p' width='7em' loading={isLoading}>
              created by{" "}
              <span className='font-medium'>
                {groupData?.creator?.username}
              </span>
            </PlaceholderDiv>
          </div>
          <div className='border-t border-slate-300 flex gap-2 items-center py-2'>
            Assigned To:
            <PlaceholderDiv loading={isLoading} className='flex gap-2 '>
              {groupData?.assignedTo?.map((user) => (
                <UserToken
                  id={user._id}
                  className='bg-white border border-slate-300 rounded-full px-2'
                />
              ))}
              <AggieButton className='hover:underline text-blue-600'>
                Change
              </AggieButton>
            </PlaceholderDiv>
          </div>

          <div className='flex gap-2'>
            <p>Description:</p>

            {groupData?.notes ? (
              <div className='px-2 py-1 border border-slate-200 rounded w-full bg-white overflow-y-auto max-h-40'>
                <p className='whitespace-pre-line max-w-prose '>
                  {groupData?.notes}
                </p>
              </div>
            ) : (
              <p className='italic text-slate-600'>No Description Set</p>
            )}
          </div>
        </header>
        <article className='mt-4'>
          <div className='px-2 py-2 flex justify-between'>
            <h2 className='text-sm font-medium flex gap-1 items-center'>
              <FontAwesomeIcon
                icon={faDotCircle}
                className='text-slate-600 mr-1'
              />
              <span className='font-normal italic text-slate-600'> user </span>
              <UserToken
                id={groupData?.creator?._id || ""}
                loading={isLoading}
              />
              <span className='font-normal italic text-slate-600'>
                {" "}
                created this incident on
              </span>{" "}
              <span>{groupData?.storedAt}</span>
            </h2>
            <p></p>
          </div>
          <div>
            {!!groupData?.comments &&
              groupData.comments.map((comment) => (
                <Comment data={comment} groupdId={id} key={comment._id} />
              ))}
          </div>
          <div className=' bg-white border border-slate-300 rounded-lg'>
            <h2 className='font-medium ml-3 my-2'>Add Comment</h2>
            <Formik
              initialValues={{ commentdata: "" }}
              onSubmit={(e, { resetForm }) => {
                onPostAdd(e, resetForm);
              }}
            >
              {({ resetForm }) => (
                <Form noValidate>
                  <Field
                    as='textarea'
                    name='commentdata'
                    className='focus-theme px-3 py-1 border-y border-slate-300 bg-slate-50 w-full min-h-36'
                    placeholder='Write a comment here...'
                  />

                  <AggieButton
                    type='submit'
                    variant='primary'
                    className='mb-2 ml-2 mt-1'
                    loading={postNewComment.isLoading}
                    disabled={postNewComment.isLoading}
                  >
                    Post
                  </AggieButton>
                </Form>
              )}
            </Formik>
          </div>
        </article>
      </main>
      <aside className='h-[90vh] grid grid-rows-[auto_1fr] sticky top-0'>
        <PlaceholderDiv
          as='h2'
          width='7em'
          loading={isLoading}
          className='text-xl font-medium'
        >
          <span className=''>({groupData?._reports.length})</span> reports
          attached
        </PlaceholderDiv>
        <div className='flex flex-col gap-1 overflow-y-auto'>
          {groupReports && groupReports.total > 0 ? (
            groupReports.results.map((report) => (
              <SocialMediaPost report={report} key={report._id} />
            ))
          ) : (
            <div className='grid place-items-center py-8 border border-slate-300 bg-white rounded-lg'>
              <p className='font-medium text-center px-3'>
                No Reports Attached! head to the{" "}
                <Link to='/reports' className='underline text-blue-600'>
                  Reports Page
                </Link>{" "}
                to add relevent reports to this page
              </p>
            </div>
          )}
        </div>
      </aside>
      <Dialog
        open={isEditOpen}
        onClose={() => console.log()}
        className='relative z-50'
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-[30rem] min-h-12 p-4 flex flex-col gap-2'>
              <IncidentForm
                group={groupData}
                onCancel={() => setIsEditOpen(false)}
                onSubmit={(values) =>
                  update.mutate(
                    { ...values, _id: groupData?._id },
                    {
                      onSuccess: () => {
                        setIsEditOpen(false);
                        queryClient.invalidateQueries(["group", id]);
                      },
                    }
                  )
                }
                isLoading={update.isLoading}
              />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default Incident;
