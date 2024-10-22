import {
  faXmark,
  faExclamationTriangle,
  faRetweet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Report } from "../../api/reports/types";
import { formatText } from "../../utils/format";
import AggieToken from "../AggieToken";
import DateTime from "../DateTime";
import GeneratedTagsList from "../GeneratedTagsList";
import { parseContentType, sanitize } from "../SocialMediaPost/reportParser";
import SocialMediaIcon from "../SocialMediaPost/SocialMediaIcon";
import { parseYoutube } from "../SocialMediaPost/YoutubePost";
import TagsList from "../Tags/TagsList";
interface IProps {
  report: Report;
  header?: React.ReactNode;
}

const SocialMediaListItem = ({ report, header }: IProps) => {
  const contentType = parseContentType(report);

  function renderText(type: typeof contentType) {
    switch (type) {
      case "twitter:quoteRetweet":
      case "twitter:retweet":
        return (
          <>
            <div className='grid place-items-center'>
              <FontAwesomeIcon icon={faRetweet} />
            </div>
            <p className=' text-black max-h-[10em] line-clamp-4'>
              {formatText(report.content)}
            </p>
          </>
        );
      case "truthsocial":
        return (
          <p
            className='truthsocial text-black'
            dangerouslySetInnerHTML={{
              __html: sanitize(report.content),
            }}
          ></p>
        );
      case "youtube":
        const { title, description } = parseYoutube(report);
        return (
          <p className=' text-black max-h-[10em] line-clamp-4'>
            <span className=''>{title} </span>
          </p>
        );
      default:
        return (
          <p className=' text-black max-h-[10em] line-clamp-4'>
            {formatText(report.content)}
          </p>
        );
    }
  }

  return (
    <>
      <header className='flex justify-between mb-2 relative'>
        <div className='flex flex-wrap gap-1 text-sm items-baseline max-w-[43em]'>
          <h1 className={`text-sm text-black mx-1 font-medium `}>
            <span className='mr-2 text-slate-600 text-xs'>
              <SocialMediaIcon mediaKey={report._media[0]} />
            </span>
            {report.author}
          </h1>

          {report.irrelevant && report.irrelevant === "true" && (
            <AggieToken variant='light:red' icon={faXmark} className='text-xs'>
              Irrelevant
            </AggieToken>
          )}
          {report.red_flag && (
            <AggieToken
              variant='dark:red'
              icon={faExclamationTriangle}
              className='text-xs'
            >
              Red Flag
            </AggieToken>
          )}
          <GeneratedTagsList tags={report.aitags} />
          <TagsList values={report.smtcTags} />
        </div>
        {header || (
          <div className='text-xs '>
            <DateTime dateString={report.authoredAt} />
          </div>
        )}
      </header>
      <div className='flex gap-2'>{renderText(contentType)}</div>
    </>
  );
};

export default SocialMediaListItem;
