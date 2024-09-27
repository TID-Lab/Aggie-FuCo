import React, { useEffect, useState } from "react";
import { Container, Col, Row, Card, ButtonToolbar } from "react-bootstrap";
import StatsBar from "../../../components/StatsBar";
import TagTable from "../../../components/tag/TagTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTag, getTags } from "../../../api/tags";
import TagModal from "../../../components/tag/TagModal";
import { io, Socket } from "socket.io-client";
import {
  faEdit,
  faEllipsisH,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import AggieButton from "../../../components/AggieButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserToken from "../../../components/UserToken";
import { stringToDate } from "../../../helpers";
import DropdownMenu from "../../../components/DropdownMenu";
import { Tag } from "../../../api/tags/types";
import AggieDialog from "../../../components/AggieDialog";
import CreateEditTagForm from "./CreateEditTagForm";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

interface IProps {}

let socket: Socket;
const SocketURL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const TagsIndex = (props: IProps) => {
  const [editOpen, setEditOpen] = useState("");
  const [deleteOpen, setDeleteOpen] = useState("");

  const queryClient = useQueryClient();
  const { data, isSuccess, refetch } = useQuery(["tags"], getTags);

  const doDeleteTag = useMutation(deleteTag, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tags"]);
      setDeleteOpen("");
    },
  });

  function tagfromId(id: string) {
    if (id === "newTag") return undefined;
    return data?.find((i) => i._id === id);
  }

  function onDeleteTag(id: string) {
    const tag = tagfromId(deleteOpen);
    !!tag && doDeleteTag.mutate(tag);
  }
  // useEffect(() => {
  //   if (!socket) {
  //     const SocketURL =
  //       process.env.NODE_ENV === "production"
  //         ? window.location.host
  //         : "ws://localhost:3000";
  //     socket = io(`${SocketURL}/tags`);
  //     socket.onAny((eventName, tag) => {
  //       console.log("Message Received from Server", eventName, tag);
  //       tagsQuery.refetch();
  //     });
  //   }
  // });

  return (
    <div className='my-3'>
      <div className='flex justify-between items-center mb-3'>
        <h3 className={"text-3xl font-medium"}>Tags</h3>

        <AggieButton
          variant='primary'
          padding='px-3 py-2'
          icon={faPlusCircle}
          onClick={() => setEditOpen("newTag")}
        >
          Create New Tag
        </AggieButton>
      </div>
      <section className='divide-y divide-slate-300 bg-white rounded-lg border border-slate-300'>
        {data &&
          data.map((tag) => (
            <article key={tag._id} className='py-2 px-3 grid grid-cols-5'>
              <header className='col-span-2'>
                <h2 className='text-lg font-medium'>{tag.name}</h2>
                <p className='text-sm'>
                  <span className='italic'>created by </span>
                  <UserToken id={tag.user?._id || ""} loading={!data} />
                  <span className='italic'> on </span>
                  <span>{stringToDate(tag.storedAt).toLocaleDateString()}</span>
                </p>
              </header>
              <main className='col-span-2 text-sm'>{tag.description}</main>
              <footer className='flex justify-end items-center'>
                <DropdownMenu
                  variant='secondary'
                  className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-300'
                  panelClassName='overflow-hidden right-0 text-sm'
                  buttonElement={<FontAwesomeIcon icon={faEllipsisH} />}
                >
                  <AggieButton
                    className='px-3 py-2 hover:bg-slate-100 text-slate-600 w-full'
                    onClick={() => setEditOpen(tag._id)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </AggieButton>
                  <AggieButton
                    className='px-3 py-2 hover:bg-slate-100 text-red-600'
                    onClick={() => setDeleteOpen(tag._id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Permanently Delete
                  </AggieButton>
                </DropdownMenu>
              </footer>
            </article>
          ))}
      </section>
      <AggieDialog
        isOpen={!!editOpen}
        onClose={() => setEditOpen("")}
        className='px-3 py-4 w-full max-w-lg'
        data={{
          title: editOpen === "newTag" ? "Create New Tag" : "Edit Tag",
        }}
      >
        <CreateEditTagForm
          tag={tagfromId(editOpen)}
          onClose={() => setEditOpen("")}
        />
      </AggieDialog>
      <ConfirmationDialog
        isOpen={!!deleteOpen}
        variant='danger'
        disabled={doDeleteTag.isLoading}
        title={`Delete Tag ${tagfromId(deleteOpen)?.name} Permanently?`}
        description={"Are you sure you want to do this?"}
        confirmText={"Delete"}
        className='text-center'
        onClose={() => setDeleteOpen("")}
        onConfirm={() => onDeleteTag(deleteOpen)}
      ></ConfirmationDialog>
    </div>
  );
};

export default TagsIndex;
