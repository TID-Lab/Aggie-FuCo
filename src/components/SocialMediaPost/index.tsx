// this entire page needs refactoring
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBookmark,
  faComment,
  faExternalLink,
  faEye,
  faHeart,
  faPlay,
  faReply,
  faRetweet,
  faShare,
  faStar,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Linkify from "linkify-react";
import { Report } from "../../api/reports/types";
import { formatAuthor, formatText } from "../../utils/format";
import PostReactions from "./PostReactions";

interface IProps {
  report: Report;
}

const SocialMediaPost = ({ report }: IProps) => {
  return (
    <div className='pt-1 pb-2  bg-white rounded-xl border border-slate-200 text-base'>
      <div className='px-3 pt-2'>
        <div className='flex justify-between mb-2'>
          {/* <TagsList values={report.smtcTags} /> */}
          <div className=' font-medium  '>
            <a
              target='_blank'
              href={report.metadata.accountUrl}
              className='hover:underline hover:bg-slate-100 group hover:text-blue-600'
            >
              <h1>
                {formatAuthor(report.author, report._media)}{" "}
                <span className='opacity-0 group-hover:opacity-100'>
                  <FontAwesomeIcon icon={faExternalLink} size='xs' />
                </span>
              </h1>
            </a>
            <p className='text-slate-600 text-xs font-normal mt-1'>
              {new Date(report.authoredAt).toLocaleString("en-us")}
            </p>
          </div>
          <p className='flex flex-col items-end gap-1'>
            <a
              target='_blank'
              href={report.url}
              className='ml-1 px-2 py-1 rounded-full border border-slate-200 font-medium text-xs inline-flex gap-1 items-center bg-slate-100 hover:bg-white text-nowrap'
            >
              <p>Open Post</p>
              <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </p>
        </div>

        <p className='whitespace-pre-line'>
          <Linkify
            options={{
              target: "_blank",
              className: "underline text-blue-600 hover:bg-slate-100 ",
            }}
          >
            {formatText(report.content)}
          </Linkify>
        </p>
        <div className='flex justify-between'>
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1'>
            <PostReactions
              stats={report.metadata.actualStatistics}
              media={report._media[0]}
            />
          </div>
          <p className='text-xs text-slate-600 text-right'>
            last fetched: <br />
            {new Date(report.fetchedAt).toLocaleString("en-us")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPost;
