import Linkify from "linkify-react";
import {
  BaseMetadata,
  Report,
  TwitterStatistics,
} from "../../api/reports/types";
import { formatText } from "../../utils/format";
import PostReactions from "./PostReactions";
import MediaPreview from "./MediaPreview";
import SocialMediaIcon from "./SocialMediaIcon";

import DateTime from "../DateTime";

import {
  parseContentType,
  isTwitterReply,
  parseTwitterQuote,
  parseTwitterRetweet,
  sanitize,
} from "./reportParser";

import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  report: Report;
  showMedia?: boolean;
}
const SocialMediaPost = ({ report, showMedia }: IProps) => {
  const contentType = parseContentType(report._media, report.metadata);

  const QuoteContent = (props: { report: Report }) => {
    const { report } = props;

    const { author, authoredAt, content, statistics } =
      parseTwitterQuote(report);

    return (
      <>
        <div className='whitespace-pre-line mb-1'>
          <Linkify
            options={{
              target: "_blank",
              className: "underline text-blue-600 hover:bg-slate-100 ",
            }}
          >
            {formatText(report.content)}
          </Linkify>
        </div>
        {showMedia && (
          <MediaPreview
            mediaUrl={report.metadata.mediaUrl}
            media={report._media[0]}
            report={report}
          />
        )}
        <div className='border border-slate-300 py-2 px-2 rounded-lg'>
          <div>
            <h2 className='font-medium'>{author?.username}</h2>
            <p className='text-sm text-slate-600'>
              {" "}
              <DateTime dateString={authoredAt} />
            </p>
          </div>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(content)}
            </Linkify>
          </div>
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
            <PostReactions stats={statistics} media={report._media[0]} />
          </div>
        </div>
      </>
    );
  };

  const RetweetContent = (props: { report: Report }) => {
    const { report } = props;
    const { author, authoredAt, content, statistics } =
      parseTwitterRetweet(report);

    return (
      <>
        <p>Retweeted:</p>
        <div className='border border-slate-300 py-2 px-2 rounded-lg'>
          <div>
            <h2 className='font-medium'>{author?.username}</h2>
            <p className='text-sm text-slate-600'>
              <DateTime dateString={authoredAt} />
            </p>
          </div>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(content)}
            </Linkify>
          </div>
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
            <PostReactions stats={statistics} media={report._media[0]} />
          </div>
        </div>
      </>
    );
  };

  const TwitterReply = (props: { report: Report }) => {
    const { report } = props;

    const { author, url } = isTwitterReply(report);
    if (!author || !url) return <></>;

    return (
      <div className=''>
        <p className='text-xs text-slate-600 italic'>
          Replying to {author}'s{" "}
          <a href={url} className='underline' target='_blank'>
            post
          </a>
        </p>
        <div className='border-l-2 border-slate-400 ml-3 h-6 my-1'></div>
      </div>
    );
  };

  return (
    <div className='pb-2 px-3 pt-3 bg-white rounded-xl border border-slate-300 text-base '>
      {report._media[0] === "twitter" && <TwitterReply report={report} />}
      <div className='flex justify-between mb-2'>
        {/* <TagsList values={report.smtcTags} /> */}
        <div className=' font-medium  '>
          <a
            target='_blank'
            href={report.metadata.accountUrl}
            title={`open ${report._media[0]} account`}
            className='hover:underline hover:bg-slate-100 group hover:text-blue-600'
          >
            <h1>
              <span className='mr-1 text-slate-600 '>
                <SocialMediaIcon mediaKey={report._media[0]} />
              </span>
              {report.author}
              <span className='opacity-0 group-hover:opacity-100'>
                <FontAwesomeIcon icon={faExternalLink} size='xs' />
              </span>
            </h1>
          </a>
          <p className='text-slate-600 text-xs font-normal mt-1'>
            <DateTime dateString={report.authoredAt} />
          </p>
        </div>
        <p className='flex flex-col items-end gap-1'>
          <a
            target='_blank'
            href={report.url}
            className='ml-1 px-2 py-1 rounded-full border border-slate-200 font-medium text-xs inline-flex gap-1 items-center bg-slate-100 hover:bg-white text-nowrap'
          >
            <span>Open Post</span>
            <FontAwesomeIcon icon={faExternalLink} />
          </a>
        </p>
      </div>

      {contentType === "twitterRetweet" && <RetweetContent report={report} />}
      {contentType === "twitterQuote" && <QuoteContent report={report} />}
      {contentType === "truthsocial" && (
        <>
          <div className='whitespace-pre-line break-all mb-1'>
            <p
              className='truthsocial'
              dangerouslySetInnerHTML={{
                __html: sanitize(report.content),
              }}
            ></p>
          </div>
          {showMedia && (
            <MediaPreview
              mediaUrl={report.metadata.mediaUrl}
              media={report._media[0]}
              report={report}
            />
          )}
        </>
      )}
      {contentType === "default" && (
        <>
          <div className='whitespace-pre-line mb-1'>
            <Linkify
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(report.content)}
            </Linkify>
          </div>
          {showMedia && (
            <MediaPreview
              mediaUrl={report.metadata.mediaUrl}
              media={report._media[0]}
              report={report}
            />
          )}
        </>
      )}

      <div className='flex justify-between'>
        <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
          <PostReactions
            stats={report.metadata.actualStatistics}
            media={report._media[0]}
          />
        </div>
        <p className='text-xs text-slate-600 text-right'>
          last fetched: <br />
          <DateTime dateString={report.fetchedAt} />
        </p>
      </div>
    </div>
  );
};

export default SocialMediaPost;
