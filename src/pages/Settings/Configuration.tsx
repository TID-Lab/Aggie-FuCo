import React, { useEffect, useState } from "react";
// import ExportCSVModal from "../components/configuration/ExportCSVModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmailSettings,
  getFetchStatus,
  putFetchingStatus,
} from "../../api/configuration";
import { Switch } from "@headlessui/react";
import AggieSwitch from "../../components/AggieSwitch";

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
          fetchSuccess && !fetchStatusMutation.isLoading ? "" : "opacity-50"
        }`}
      >
        <h2 className='font-medium text-lg'>Enable Fetching</h2>
        <AggieSwitch
          checked={fetchStatus}
          onChange={() => {
            fetchStatusMutation.mutate(!fetchStatus);
          }}
          label='Enable Fetching'
          disabled={!fetchSuccess || fetchStatusMutation.isLoading}
        />
      </div>
    </section>
  );
};

export default Configuration;
