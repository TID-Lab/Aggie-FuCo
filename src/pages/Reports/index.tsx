import { useOutlet, useNavigate } from "react-router-dom";

const Reports = ({ children }: { children: React.ReactNode }) => {
  const outlet = useOutlet();

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
