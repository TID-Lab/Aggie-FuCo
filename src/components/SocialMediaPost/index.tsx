import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Linkify from "linkify-react";
import {
  BaseMetadata,
  Report,
  TwitterStatistics,
} from "../../api/reports/types";
import { formatAuthor, formatText } from "../../utils/format";
import PostReactions from "./PostReactions";
import MediaPreview from "./MediaPreview";
import SocialMediaIcon from "./SocialMediaIcon";
import { MediaOptions } from "../../api/common";
import { useEffect, useState } from "react";
import { pick } from "lodash";
interface IProps {
  report: Report;
  showMedia?: boolean;
}

type ContentType = "default" | "twitterQuote" | "twitterRetweet";

const SocialMediaPost = ({ report, showMedia }: IProps) => {
  const contentType = isRetweet(report._media, report.metadata);

  function isRetweet(
    _media: MediaOptions[],
    metadata: BaseMetadata
  ): ContentType {
    if (!_media || _media[0] !== "twitter") return "default";
    const rawPostData = (metadata.rawAPIResponse.attributes as any)?.post_data;
    if (!rawPostData) return "default";
    const isQuoteRetweet = rawPostData.quoted_status_result?.result;
    if (isQuoteRetweet) {
      return "twitterQuote";
    }
    const isRetweet = rawPostData.retweeted_status_result?.result;
    if (isRetweet) {
      return "twitterRetweet";
    }
    return "default";
  }

  function getTwitterUserDetails(rawPostData: any) {
    const userData = rawPostData?.core?.user_results?.result?.legacy;
    if (!userData) return undefined;
    return {
      name: userData.name,
      username: userData.screen_name,
      followers: userData.followers_count,
      url: userData.url,
      createdAt: userData.created_at,
    };
  }

  const QuoteContent = (props: { report: Report }) => {
    const { report } = props;
    const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
      ?.post_data;

    const retweetResult = rawPostData.quoted_status_result?.result;

    const innerAuthor = getTwitterUserDetails(retweetResult);

    const post = {
      content: retweetResult.legacy?.full_text,
      authoredAt: retweetResult.legacy?.created_at,
    };
    const postStats: TwitterStatistics = {
      reply_count: retweetResult.legacy?.reply_count,
      retweet_count:
        retweetResult.legacy?.retweet_count + retweetResult.legacy?.quote_count,
      like_count: retweetResult.legacy?.favorite_count,
      view_count: retweetResult.views?.count,
    };

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
            <h2 className='font-medium'>{innerAuthor?.username}</h2>
            <p className='text-sm text-slate-600'>{post.authoredAt}</p>
          </div>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(post.content)}
            </Linkify>
          </div>
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
            <PostReactions stats={postStats} media={report._media[0]} />
          </div>
        </div>
      </>
    );
  };

  const RetweetContent = (props: { report: Report }) => {
    const { report } = props;
    const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
      ?.post_data;

    const retweetResult = rawPostData.retweeted_status_result?.result;

    const innerAuthor = getTwitterUserDetails(retweetResult);

    const post = {
      content: retweetResult.legacy?.full_text,
      authoredAt: retweetResult.legacy?.created_at,
    };
    const postStats: TwitterStatistics = {
      reply_count: retweetResult.legacy?.reply_count,
      retweet_count:
        retweetResult.legacy?.retweet_count + retweetResult.legacy?.quote_count,
      like_count: retweetResult.legacy?.favorite_count,
      view_count: retweetResult.views?.count,
    };

    return (
      <>
        <p>Retweeted:</p>
        <div className='border border-slate-300 py-2 px-2 rounded-lg'>
          <div>
            <h2 className='font-medium'>{innerAuthor?.username}</h2>
            <p className='text-sm text-slate-600'>{post.authoredAt}</p>
          </div>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(post.content)}
            </Linkify>
          </div>
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
            <PostReactions stats={postStats} media={report._media[0]} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='pt-1 pb-2  bg-white rounded-xl border border-slate-200 text-base font-emojisans'>
      <div className='px-3 pt-2'>
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
              <span>Open Post</span>
              <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </p>
        </div>
        {contentType === "twitterRetweet" && <RetweetContent report={report} />}
        {contentType === "twitterQuote" && <QuoteContent report={report} />}

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
            {new Date(report.fetchedAt).toLocaleString("en-us")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPost;
