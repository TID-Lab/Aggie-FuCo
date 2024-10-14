import { Report } from "../../api/reports/types";
import { formatText } from "../../utils/format";
import DateTime from "../DateTime";
import PostReactions from "./PostReactions";
import { isTwitterReply, parseTwitterRetweet } from "./reportParser";

const TwitterPost = () => {
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

  return <></>;
};

export default TwitterPost;
