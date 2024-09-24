import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSource, editSource, getSources } from "../../../api/sources";
import { getCredentials } from "../../../api/credentials";
import { Credential, Source } from "../../../objectTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEllipsisH,
  faEllipsisV,
  faExclamationTriangle,
  faKey,
  faPlusCircle,
  faSpinner,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import { io, Socket } from "socket.io-client";
import AxiosErrorCard from "../../../components/AxiosErrorCard";
import { Link } from "react-router-dom";
import AggieSwitch from "../../../components/AggieSwitch";
import DropdownMenu from "../../../components/DropdownMenu";
import AggieButton from "../../../components/AggieButton";
import AggieDialog from "../../../components/AggieDialog";
import { useState } from "react";
import CreateEditSourceForm from "./CreateEditSourceForm";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

interface IProps {}

let socket: Socket;

const SourcesIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const { data, isError, error } = useQuery(["sources"], getSources);

  const [deletionModal, setDeletionModal] = useState<Source>();
  const [openCreate, setOpenCreate] = useState("");

  // useEffect(() => {
  //   if (!socket) {
  //     socket = io("ws://localhost:3000/sources");

  //     socket.onAny((eventName, tag) => {
  //       console.log("Message Received from Server", eventName, tag);
  //       sourcesQuery.refetch();
  //     });
  //   }
  // });

  const doDeleteSource = useMutation(deleteSource, {
    onSuccess: () => {
      setDeletionModal(undefined);
      queryClient.invalidateQueries(["credentials"]);
    },
  });
  const doEnableSource = useMutation(editSource, {
    onSuccess: () => {
      queryClient.invalidateQueries(["credentials"]);
    },
  });

  function getSourceFromId(id: string) {
    if (id === "new") return undefined;
    return data?.find((i) => i._id === id);
  }

  if (isError)
    return (
      <div className='mt-4'>
        <AxiosErrorCard error={error} />
      </div>
    );

  return (
    <div className='mt-3'>
      <div className='flex justify-between items-center'>
        <h1 className={"my-3 text-3xl font-medium"}>Sources</h1>
        <AggieButton
          onClick={() => setOpenCreate("new")}
          variant='primary'
          padding='px-3 py-2'
          icon={faPlusCircle}
        >
          Create New Credential
        </AggieButton>
      </div>{" "}
      <section className='bg-white rounded-lg border border-slate-300 overflow-hidden divide-y divide-slate-300'>
        {data &&
          data.map((source) => (
            <article
              key={source._id}
              className='grid grid-cols-6 py-3 px-3 text-slate-600 items-center text-xs font-medium'
            >
              <main className='col-span-3'>
                <Link
                  to={`/settings/source/${source._id}`}
                  className='hover:underline  '
                >
                  <h2 className='font-medium text-blue-600  text-base'>
                    {source.nickname}
                  </h2>
                </Link>

                <p className='text-sm '>{source.keywords}</p>
              </main>
              <div>
                <p className=' bg-slate-200 rounded-full px-2  w-fit  py-1'>
                  <Link
                    to={`/settings/credentials`}
                    className='hover:underline flex items-center gap-2'
                    title='API Key Credential'
                  >
                    <FontAwesomeIcon
                      icon={faKey}
                      size='xs'
                      className='text-slate-500'
                    />
                    {source.credentials.name}
                  </Link>
                </p>
              </div>
              <div>
                <p className='flex items-center gap-2 bg-orange-100 rounded-full px-2  w-fit py-1'>
                  <Link
                    to={`/settings/source/${source._id}`}
                    className='hover:underline text-orange-800 '
                    title='Errors due to fetching source'
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      size='xs'
                      className='text-orange-600'
                    />
                    {source.unreadErrorCount} Warnings
                  </Link>
                </p>
              </div>
              <div className='flex justify-end items-center gap-2'>
                <p className='text-xs font-medium text-slate-600'>
                  {source.enabled ? "Enabled" : "Disabled"}
                </p>
                <div className='flex items-center gap-1'>
                  {doEnableSource.isLoading && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className={"animate-spin"}
                    />
                  )}
                  <AggieSwitch
                    checked={source.enabled}
                    onChange={() => {
                      doEnableSource.mutate({
                        ...source,
                        enabled: !source.enabled,
                      });
                    }}
                    label='Enable Source'
                    disabled={doEnableSource.isLoading}
                  />
                </div>

                <DropdownMenu
                  variant='secondary'
                  className='px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 text-base'
                  panelClassName='overflow-hidden right-0 text-sm'
                  buttonElement={<FontAwesomeIcon icon={faEllipsisH} />}
                >
                  <AggieButton
                    className='px-3 py-2 hover:bg-slate-100 text-slate-600 w-full'
                    onClick={() => setOpenCreate(source._id)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </AggieButton>
                  <AggieButton
                    className='px-3 py-2 hover:bg-slate-100 text-red-600'
                    onClick={() => setDeletionModal(source)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Permanently Delete
                  </AggieButton>
                </DropdownMenu>
              </div>
            </article>
          ))}
      </section>
      <ConfirmationDialog
        isOpen={!!deletionModal}
        variant='danger'
        disabled={doDeleteSource.isLoading}
        className='w-full max-w-lg text-center'
        title={`Delete: ${
          data?.find((c) => c._id === deletionModal?._id)?.nickname
        }?`}
        confirmText={"Delete"}
        onClose={() => setDeletionModal(undefined)}
        onConfirm={() =>
          !!deletionModal && doDeleteSource.mutate(deletionModal)
        }
      ></ConfirmationDialog>
      <AggieDialog
        isOpen={!!openCreate}
        onClose={() => setOpenCreate("")}
        data={{ title: "Create New Source" }}
        className='p-3 w-full max-w-lg'
      >
        <CreateEditSourceForm
          source={getSourceFromId(openCreate)}
          onClose={() => setOpenCreate("")}
        />
      </AggieDialog>
    </div>
  );
};

export default SourcesIndex;
