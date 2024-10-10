import { useOutlet, useNavigate } from "react-router-dom";

const ReportLayout = () => {
  return (
    <section className='max-w-screen-2xl mx-auto px-4 grid grid-cols-3 gap-3'>
      <main className='col-span-2 '></main>
      <aside className='col-span-1'></aside>
    </section>
  );
};

export default ReportLayout;
