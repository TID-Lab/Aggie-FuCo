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
import TagsList from "../../components/tag/TagsList";
import { Report } from "../../types/reports";
import { formatAuthor, formatText } from "../../utils/format";

interface IReportListItemSmall {
  report: Report;
}

const ReportListItemSmall = ({ report }: IReportListItemSmall) => {
  function reaction(
    icon: IconProp,
    value: string | number | undefined | null,
    showZero = true
  ) {
    if (value === undefined || value === null) return <></>;
    if (!showZero && (value === 0 || value === "0")) return <></>;
    return (
      <span className='flex gap-1 items-center'>
        <FontAwesomeIcon icon={icon} /> {value}
      </span>
    );
  }
  function statistics() {
    if (!report._media) return <></>;

    const stats = report.metadata.actualStatistics;
    switch (report._media[0]) {
      case "twitter": {
        return (
          <>
            {reaction(faHeart, stats.like_count)}
            {reaction(faComment, stats.reply_count)}
            {reaction(faRetweet, stats.retweet_count)}
            {reaction(faEye, stats.view_count)}
          </>
        );
      }
      case "facebook": {
        return (
          <>
            <span className=' bg-slate-200 rounded-full px-2'>
              {stats.angryCount +
                stats.careCount +
                stats.hahaCount +
                stats.likeCount +
                stats.sadCount +
                stats.loveCount +
                stats.thankfulCount +
                stats.wowCount}{" "}
              Reactions
            </span>
            {reaction(faComment, stats.commentCount)}
            {reaction(faShare, stats.shareCount)}
          </>
        );
      }
      case "tiktok": {
        return (
          <>
            {reaction(faPlay, stats.playCount)}
            {reaction(faComment, stats.commentCount)}
            {reaction(faShare, stats.shareCount)}
            {reaction(faRetweet, stats.repostCount)}
            {reaction(faBookmark, stats.collectCount)}
          </>
        );
      }
      case "youtube": {
        return (
          <>
            {reaction(faThumbsUp, stats.like_count)}
            {reaction(faThumbsDown, stats.dislike_count)}

            {reaction(faComment, stats.comment_count)}
            {reaction(faEye, stats.view_count)}
            {reaction(faStar, stats.favorite_count)}
          </>
        );
      }
      default:
        return <></>;
    }
  }
  return (
    <div className='pt-1 pb-2  bg-white rounded-xl border border-slate-200 text-base'>
      <div className='px-3 pt-2'>
        <div className='flex justify-between mb-2'>
          {/* <TagsList values={report.smtcTags} /> */}
          <div className=' font-medium  '>
            <h1>{formatAuthor(report.author, report._media)}</h1>
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
          <div className='flex gap-3 text-sm text-slate-600 font-medium mt-1'>
            {statistics()}
          </div>
          <p className='text-xs font-medium text-slate-600'>
            last fetched: {new Date(report.fetchedAt).toLocaleString("en-us")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportListItemSmall;
