import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useUpdateQueryData } from "../../hooks/useUpdateQueryData";
import { SocketEvent, useSocketSubscribe } from "../../hooks/WebsocketProvider";
import type { Reports as IReports } from "../../api/reports/types";
import { updateByIds } from "../../utils/immutable";

const Reports = ({ children }: { children: React.ReactNode }) => {
  const queryData = useUpdateQueryData();
  const location = useLocation();

  const outlet = useOutlet();
  const handleSocketUpdate = (message: SocketEvent) => {
    const d = message.data as any;
    if (message.event !== "reports:read") return;
    console.log("catch", message);

    queryData.update<IReports>(["reports"], (data) => {
      const updateData = updateByIds(d.ids, data.results, {
        read: d.read,
      });
      return {
        results: updateData,
      };
    });
  };
  useSocketSubscribe("reports:read", handleSocketUpdate);
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-3'>
      <main className='col-span-2 '>{children}</main>
      <aside className='col-span-1'>
        {!outlet || !outlet.type ? (
          <p className='grid w-full py-24 place-items-center font-medium sticky top-2 bg-slate-50 rounded-lg mt-4'>
            Select a report to view in this window
          </p>
        ) : (
          outlet
        )}
      </aside>
    </section>
  );
};

export default Reports;
