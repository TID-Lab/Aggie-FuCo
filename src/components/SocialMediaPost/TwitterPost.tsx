import { Report, TwitterStatistics } from "../../api/reports/types";
import { formatText } from "../../utils/format";
import DateTime from "../DateTime";
import PostReactions from "./PostReactions";
import Linkify from "linkify-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import { getTweetImages } from "./reportParser";

function parseTwitterUser(rawPostData: any) {
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

function parseQuoteRetweet(post_data: any) {
  const retweetResult = post_data?.retweeted_status_result?.result;
  const quotedResult = post_data.quoted_status_result?.result;

  const result = retweetResult || quotedResult;
  const images = tweetImages(result?.legacy);
  const innerAuthor = parseTwitterUser(result);

  const statistics: TwitterStatistics = {
    reply_count: result.legacy?.reply_count,
    retweet_count: result.legacy?.retweet_count + result.legacy?.quote_count,
    like_count: result.legacy?.favorite_count,
    view_count: result.views?.count,
  };

  return {
    author: innerAuthor,
    authoredAt: result.legacy?.created_at,
    content: result.legacy?.full_text,
    statistics,
    images,
  };
}

function RenderLinkCard(post_data: any) {
  const extended_media = post_data?.extended_media;
}
function tweetImages(post_data: any) {
  const media = post_data?.entities?.media as unknown[];
  if (!media || media.length === 0) return undefined;
  const result = media.map((item: any) => {
    return {
      type: item.type,
      url: item.media_url_https + "?format=jpg&name=medium",
    };
  });
  return result;
}

// ----------- component
interface IProps {
  report: Report;
}
const TwitterPost = ({ report }: IProps) => {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.post_data;
  console.log(report);

  const isQuoteRetweet = !!rawPostData.quoted_status_result?.result;

  const isRetweet = !!rawPostData.retweeted_status_result?.result;

  function formatTwitter(index: number, total: number) {
    if (total === 1) return "h-auto col-span-2 max-h-[60vh]";
    if (total === 3 && index === 0) return "h-full row-span-2 col-span-1";
    return "h-full";
  }
  const RenderImages = (images: ReturnType<typeof tweetImages>) => {
    if (!images || images.length === 0) return <></>;

    return (
      <div className='min-h-[30vh] relative grid grid-cols-2 gap-1'>
        {images.map((image, index: number) => (
          <img
            key={index}
            className={`w-full rounded object-cover ${formatTwitter(
              index,
              images.length
            )}`}
            src={image.url}
            loading='lazy'
          />
        ))}
      </div>
    );
  };
  const QuoteRetweetContent = () => {
    const { author, authoredAt, content, statistics, images } =
      parseQuoteRetweet(rawPostData);

    return (
      <>
        <div className='border border-slate-300 py-2 px-2 rounded-lg'>
          <div>
            <h2 className='font-medium'>{author?.username}</h2>
            <p className='text-sm text-slate-600'>
              <DateTime dateString={authoredAt} />
            </p>
          </div>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              key={report._id + ":inner"}
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(content)}
            </Linkify>
          </div>
          {RenderImages(images)}
          <div className='flex gap-3 text-sm text-slate-500 font-medium mt-1 items-center'>
            <PostReactions stats={statistics} media={report._media[0]} />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {!isRetweet ? (
        <>
          <div className='whitespace-pre-line my-2'>
            <Linkify
              key={report._id}
              options={{
                target: "_blank",
                className: "underline text-blue-600 hover:bg-slate-100 ",
              }}
            >
              {formatText(report.content)}
            </Linkify>
          </div>
          {RenderImages(tweetImages(rawPostData))}
        </>
      ) : (
        <p className='text-sm text-slate-600'>
          <FontAwesomeIcon icon={faRetweet} /> Retweeted:
        </p>
      )}

      {(isQuoteRetweet || isRetweet) && <QuoteRetweetContent />}
    </>
  );
};

export default TwitterPost;
