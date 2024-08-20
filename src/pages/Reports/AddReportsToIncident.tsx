import { Dialog } from "@headlessui/react";
import React from "react";
import type { Report, Reports } from "../../objectTypes";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../../api/groups";
import { getReports } from "../../api/reports";
interface IAddReportsToIncidents {
  isOpen: boolean;
  reports?: Report[];
}
const AddReportsToIncidents = ({ isOpen, reports }: IAddReportsToIncidents) => {
  const { data: incidents } = useQuery(["groups"], () => getGroups());

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        return undefined;
      }}
      className='relative z-50'
    >
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <Dialog.Panel className='bg-white rounded-xl border border-slate-200 shadow-xl min-w-24 min-h-12 p-4 grid grid-cols-2 gap-2'>
          <div>
            {reports && reports.map((item) => <div>{item.author}</div>)}
          </div>
          <div>
            <div className='flex flex-col'>
              {incidents &&
                incidents.results.map((item) => <div>{item.title}</div>)}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddReportsToIncidents;
