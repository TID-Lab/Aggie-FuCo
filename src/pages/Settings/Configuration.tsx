import React, { useEffect, useState } from "react";
// import ExportCSVModal from "../components/configuration/ExportCSVModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmailSettings,
  getFetchStatus,
  putFetchingStatus,
} from "../../api/configuration";
import { Switch } from "@headlessui/react";

const Configuration = () => {
  const [fetchStatus, setFetchStatus] = useState<boolean>(false);
  const [appEmail, setAppEmail] = useState("");
  // const emailSettingsQuery = useQuery(["emailSettings"], getEmailSettings, {
  //   onSuccess: (data) => {
  //     console.log(data);
  //   },
  // });
  const { data: fetchData, isSuccess: fetchSuccess } = useQuery(
    ["fetchStatus"],
    getFetchStatus
  );
  useEffect(() => {
    if (fetchData?.fetching) {
      setFetchStatus(fetchData.fetching);
    }
  }, [fetchData]);

  const fetchStatusMutation = useMutation(
    (fetching: boolean) => {
      return putFetchingStatus(fetching);
    },
    {
      onSuccess: () => {
        setFetchStatus(!fetchStatus);
        console.log("Fetching is on: " + !fetchStatus);
      },
    }
  );

  return (
    <section className='w-full'>
      <h1 className='font-medium text-3xl my-3'> Configuration</h1>
      <div
        className={`px-4 py-3 bg-white border border-slate-300 rounded-lg flex justify-between items-center ${
          fetchSuccess && !fetchStatusMutation.isLoading
            ? ""
            : "pointer-events-none opacity-50"
        }`}
      >
        <h2 className='font-medium text-lg'>Enable Fetching</h2>
        <Switch
          checked={fetchStatus}
          onChange={() => {
            fetchStatusMutation.mutate(!fetchStatus);
          }}
          className={`${
            fetchStatus ? "bg-blue-600" : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full border border-slate-300`}
        >
          <span className='sr-only'>Enable Fetching</span>
          <span
            className={`${
              fetchStatus ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition border border-slate-300`}
          />
        </Switch>
      </div>
    </section>
  );
};

export default Configuration;
