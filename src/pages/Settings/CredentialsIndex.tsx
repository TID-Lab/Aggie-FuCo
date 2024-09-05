import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCredential, getCredentials } from "../../api/credentials";
import { useState } from "react";
import type { Credential } from "../../api/credentials/types";

import AxiosErrorCard from "../../components/AxiosErrorCard";
import AggieButton from "../../components/AggieButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import CredentialModal from "../../components/credentials/CredentialModal";
interface IProps {}

const CredentialsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const [deletionModal, setDeletionModal] = useState<Credential>();
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const { data, isError, error } = useQuery(["credentials"], getCredentials);
  const deleteMutation = useMutation(deleteCredential, {
    onSuccess: () => {
      setDeletionModal(undefined);
      queryClient.invalidateQueries(["credentials"]);
    },
  });

  const grid = "grid grid-cols-6";

  if (isError)
    return (
      <section className='max-w-screen-lg mx-auto'>
        <AxiosErrorCard error={error} />
      </section>
    );

  return (
    <section className='max-w-screen-lg mx-auto px-2'>
      <div className='flex justify-between items-center'>
        <h1 className={"my-3 text-3xl font-medium"}>Credentials</h1>
        <CredentialModal />
      </div>
      <div className='flex flex-col overflow-hidden bg-white border border-slate-300 rounded-lg divide-y divide-slate-300'>
        <header
          className={`${grid} px-3 py-2 font-medium text-sm border-b border-slate-300`}
        >
          <p>Type</p>
          <p>Label</p>
        </header>
        {data &&
          data.map((credential) => (
            <div className={`${grid} px-3 py-3`} key={credential._id}>
              <div className='text-sm items-center'>{credential.type}</div>
              <p className='col-start-2 -col-end-1 font-medium flex justify-between items-center'>
                {credential.name}
                <AggieButton
                  onClick={() => setDeletionModal(credential)}
                  className='border border-slate-300 bg-slate-100 rounded px-2 py-2 hover:bg-slate-200'
                >
                  <FontAwesomeIcon icon={faTrash} />
                </AggieButton>
              </p>
            </div>
          ))}
        <ConfirmationDialog
          isOpen={!!deletionModal}
          onClose={() => setDeletionModal(undefined)}
          onConfirm={() => {
            if (!!deletionModal) deleteMutation.mutate(deletionModal);
          }}
          data={{
            title: `Delete: ${
              data?.find((c) => c._id === deletionModal?._id)?.name
            }?`,
          }}
          confirmButton={
            <span className='bg-red-700 text-white hover:bg-red-600 rounded-lg flex gap-1 items-center px-2 py-1'>
              <FontAwesomeIcon
                icon={deleteMutation.isLoading ? faSpinner : faTrash}
                className={deleteMutation.isLoading ? "animate-spin" : ""}
              />
              Delete
            </span>
          }
          disabled={deleteMutation.isLoading}
        >
          <div className='mx-3 my-2 max-w-lg'>
            <p>Are you sure you want to do this?</p>
          </div>
        </ConfirmationDialog>
      </div>
    </section>
  );
};

export default CredentialsIndex;
