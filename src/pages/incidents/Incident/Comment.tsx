import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { editComment, removeComment } from "../../../api/groups";
import { GroupComment } from "../../../api/groups/types";
import type { Session } from "../../../api/session/types";
import { faComment, faCommentAlt } from "@fortawesome/free-regular-svg-icons";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AggieButton from "../../../components/AggieButton";
import UserToken from "../../../components/UserToken";
import { Formik, Field, Form } from "formik";
import { getSession } from "../../../api/session";
import Linkify from "linkify-react";

interface IProps {
  data: GroupComment;
  groupdId: string | undefined;
}
const Comment = ({ data, groupdId }: IProps) => {
  const queryClient = useQueryClient();
  const [edit, setEdit] = useState(false);
  const { data: session } = useQuery(["session"], getSession, {
    staleTime: 50000,
  });

  const deleteComment = useMutation(removeComment, {
    onSuccess() {
      queryClient.invalidateQueries(["group", groupdId]);
    },
  });
  const updateComment = useMutation(editComment, {
    onSuccess() {
      queryClient.invalidateQueries(["group", groupdId]);
    },
  });

  function onEditSubmit(
    formData: { commentdata: string },
    resetForm: () => void
  ) {
    updateComment.mutate(
      {
        groupId: groupdId,
        comment: { ...data, data: formData.commentdata },
      },
      {
        onSuccess: () => {
          resetForm();
          setEdit(false);
          queryClient.invalidateQueries(["group", groupdId]);
        },
      }
    );
  }
  if (!groupdId) return <></>;
  return (
    <div
      key={data._id}
      className='border border-slate-300 rounded-lg bg-slate-50 overflow-hidden my-2'
    >
      <div className='flex justify-between text-sm py-2 px-2 border-b border-slate-300'>
        <p className='inline-flex items-center text-slate-600 gap-1'>
          <FontAwesomeIcon icon={faCommentAlt} /> <UserToken id={data.author} />
          <span className='italic '>comments </span>
        </p>
        <div className='flex gap-2 items-center'>
          <p className='italic'>
            last updated {data.updatedAt || data.createdAt}
          </p>
          {(data.author === session?._id || session?.role === "admin") && (
            <>
              <AggieButton
                variant='secondary'
                onClick={() => setEdit(true)}
                disabled={edit}
              >
                <FontAwesomeIcon icon={faEdit} />
              </AggieButton>
              <AggieButton
                variant='secondary'
                onClick={() =>
                  deleteComment.mutate({ groupId: groupdId, comment: data })
                }
                loading={deleteComment.isLoading}
                disabled={deleteComment.isLoading}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </AggieButton>
            </>
          )}
        </div>
      </div>
      {edit ? (
        <>
          <Formik
            initialValues={{ commentdata: data.data }}
            onSubmit={(e, { resetForm }) => {
              onEditSubmit(e, resetForm);
            }}
          >
            {({ resetForm }) => (
              <Form noValidate>
                <Field
                  as='textarea'
                  name='commentdata'
                  className='focus-theme px-3 py-2 border-b border-slate-300 bg-white w-full min-h-36'
                  placeholder='Write a comment here...'
                />
                <AggieButton
                  type='button'
                  variant='secondary'
                  className='mb-2 ml-2 mt-1'
                  onClick={() => {
                    resetForm();
                    setEdit(false);
                  }}
                >
                  Cancel
                </AggieButton>
                <AggieButton
                  type='submit'
                  variant='primary'
                  className='mb-2 ml-2 mt-1'
                >
                  Update
                </AggieButton>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <p className='whitespace-pre-line px-3 py-3 bg-white'>
          <Linkify>{data.data}</Linkify>
        </p>
      )}
    </div>
  );
};

export default Comment;
