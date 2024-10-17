import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { url } from "inspector";
import { report } from "process";
import DateTime from "../DateTime";

interface IProps {
  name?: string;
  username: string;
  pfp?: string;
  createdAt: string;
  url?: string;
}

const SocialMediaAuthor = ({ name, username, pfp, createdAt, url }: IProps) => {
  if (!url)
    return (
      <div>
        <h2 className='font-medium'>{name || username}</h2>

        <p className='text-sm text-slate-700'>
          <DateTime dateString={createdAt} />
        </p>
      </div>
    );
  return (
    <a
      target='_blank'
      href={url}
      title={`open ${username}'s account`}
      className=' hover:bg-slate-100 block group p-1 -m-1 hover:text-blue-600 relative rounded-lg'
    >
      <h1>
        <h2 className='font-medium group-hover:underline'>
          {name || username}
        </h2>

        <p className='text-sm text-slate-700'>
          <DateTime dateString={createdAt} />
        </p>
        <span className='opacity-0 absolute top-1 right-1 group-hover:opacity-100'>
          <FontAwesomeIcon icon={faExternalLink} size='xs' />
        </span>
      </h1>
    </a>
  );
};

export default SocialMediaAuthor;
