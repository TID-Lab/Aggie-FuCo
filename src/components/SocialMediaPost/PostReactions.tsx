import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBookmark,
  faComment,
  faEye,
  faHeart,
  faPlay,
  faRetweet,
  faShare,
  faStar,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { MediaOptions } from "../../api/common";
import type { Statistics } from "../../api/reports/types";

interface IProps {
  stats: Statistics;
  media: MediaOptions | undefined;
}

const PostReactions = ({ stats, media }: IProps) => {
  // helper component that show/hides values
  const Reaction = (props: {
    icon: IconProp;
    value: string | number | undefined | null;
    hideZero?: boolean;
  }) => {
    if (props.value === undefined || props.value === null) return <></>;
    if (!!props.hideZero && (props.value === 0 || props.value === "0"))
      return <></>;
    return (
      <span className='flex gap-1 items-center'>
        <FontAwesomeIcon icon={props.icon} /> {props.value}
      </span>
    );
  };

  switch (media) {
    case "twitter": {
      return (
        <>
          <Reaction icon={faHeart} value={stats.like_count} />
          <Reaction icon={faComment} value={stats.reply_count} />
          <Reaction icon={faRetweet} value={stats.retweet_count} />
          <Reaction icon={faEye} value={stats.view_count} />
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
          <Reaction icon={faComment} value={stats.commentCount} />
          <Reaction icon={faShare} value={stats.shareCount} />
        </>
      );
    }
    case "tiktok": {
      return (
        <>
          <Reaction icon={faPlay} value={stats.playCount} />
          <Reaction icon={faComment} value={stats.commentCount} />
          <Reaction icon={faShare} value={stats.shareCount} />
          <Reaction icon={faRetweet} value={stats.repostCount} />
          <Reaction icon={faBookmark} value={stats.collectCount} />
        </>
      );
    }
    case "youtube": {
      return (
        <>
          <Reaction icon={faThumbsUp} value={stats.like_count} />
          <Reaction icon={faThumbsDown} value={stats.dislike_count} />
          <Reaction icon={faComment} value={stats.comment_count} />
          <Reaction icon={faEye} value={stats.view_count} />
          <Reaction icon={faStar} value={stats.favorite_count} />
        </>
      );
    }
    default:
      return <></>;
  }
};

export default PostReactions;
