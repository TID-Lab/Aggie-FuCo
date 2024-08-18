import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getReport } from "../../../api/reports";
import TagsList from "../../../components/tag/TagsList";
import { formatHashtag } from "../../../utils/format";
import Linkify from "linkify-react";
import AggieButton from "../../../components/AggieButton";
import { Listbox, Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faFile, faPlus } from "@fortawesome/free-solid-svg-icons";

const Report = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const reportQuery = useQuery(["report", id], () => getReport(id));

  function newIncidentFromReport() {
    const params = new URLSearchParams({
      reports: [id].toString(),
    });

    navigate("/incidents/new?" + params.toString());
  }

  if (reportQuery.isLoading) return <span>...loading</span>;
  if (reportQuery.data) {
    console.log(reportQuery.data.metadata);
    return (
      <article className='pt-4 sticky top-0 overflow-y-auto max-h-[93vh] pr-2'>
        <nav className='px-2 py-2 flex justify-between items-center text-sm border border-slate-300 mb-2 shadow-md'>
          <h2 className='text-sm font-medium'>Quick Actions</h2>
          <div className='flex gap-1'>
            <button className='px-2 py-1 rounded-lg bg-slate-300'>
              mark unread
            </button>
            <div className='flex font-medium'>
              <AggieButton
                className='px-2 py-1 rounded-l-lg bg-slate-100 border border-slate-200 hover:bg-slate-200'
                onClick={newIncidentFromReport}
              >
                <FontAwesomeIcon icon={faPlus} />
                Attach Incident
              </AggieButton>
              <Menu as='div' className='relative'>
                <Menu.Button className='px-2 py-1 rounded-r-lg bg-slate-100 border-y border-r border-slate-200 hover:bg-slate-200 ui-open:bg-slate-300'>
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className='ui-open:rotate-180'
                  />
                </Menu.Button>
                <Menu.Items className='absolute top-full right-0 mt-1 shadow-md rounded-lg bg-white border border-slate-200'>
                  <Menu.Item>
                    {({ active }) => (
                      <AggieButton
                        className='px-3 py-2   hover:bg-slate-200'
                        onClick={newIncidentFromReport}
                      >
                        <FontAwesomeIcon icon={faFile} />
                        Create New Incident with Report
                      </AggieButton>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </nav>
        <div className='py-2  bg-slate-50 rounded-xl border border-slate-200'>
          <div className='px-3 pb-1 border-b flex justify-between text-sm'>
            <p>platform: {reportQuery.data._media}</p>
            <p>open post in new window</p>
          </div>
          <div className='px-3 pt-2'>
            <TagsList values={reportQuery.data.smtcTags} />
            <h1 className='text-lg font-medium'>{reportQuery.data.author}</h1>
            <p className='text-lg'>
              <Linkify
                options={{
                  target: "_blank",
                }}
              >
                {reportQuery.data.content
                  .split(" ")
                  .map((word) => formatHashtag(word, "text-slate-600"))}
              </Linkify>
            </p>
            <p>{reportQuery.data._id}</p>
          </div>
        </div>
      </article>
    );
  }
  return <> bruh</>;
};

export default Report;
