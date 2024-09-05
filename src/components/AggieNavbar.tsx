import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsersCog,
  faTags,
  faKey,
  faCog,
  faCloudArrowDown,
  faRightFromBracket,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Menu } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import { Session } from "../objectTypes";
import { faUser } from "@fortawesome/free-regular-svg-icons";

const mainLinks = {
  Reports: { to: "/reports" },
  Incidents: { to: "/incidents" },
};

const menuLinks = {
  Config: { to: "/settings/config", icon: faCog },
  Credentials: { to: "/settings/credentials", icon: faKey },
  "Manage Users": { to: "/settings/users", icon: faUsersCog },
  "Manage Tags": { to: "/settings/tags", icon: faTags },
  "Manage Sources": { to: "/settings/sources", icon: faCloudArrowDown },
  "Log Out": { to: "/404", icon: faRightFromBracket },
};

interface IProps {
  isAuthenticated: boolean;
  session: Session | undefined;
}
const AggieNavbar = ({ isAuthenticated, session }: IProps) => {
  const location = useLocation();
  const isActive = (to: string) => location.pathname.includes(to);

  if (!isAuthenticated) return <></>;
  return (
    <nav className='w-full bg-white flex justify-between items-center px-4 border-b border-gray-200 py-2'>
      <div className='flex gap-2 items-center '>
        <div>
          <svg
            fill='none'
            viewBox='0 0 62 62'
            className='w-10 h-10 bg-[#416B34] text-white px-2 rounded-lg'
          >
            <path
              d='M31 39a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm15-15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-4-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 29a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-43 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm30 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14-28a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-43 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm16 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'
              fill='currentColor'
            />
          </svg>
        </div>
        <div className='flex rounded-lg font-medium gap-1 mx-2 '>
          {Object.entries(mainLinks).map(([name, path]) => (
            <Link
              key={name}
              to={path.to}
              className={`px-2 rounded-lg focus-theme ${
                isActive(path.to)
                  ? "pointer-events-none"
                  : "hover:bg-gray-100 rounded-lg text-[#416B34] hover:text-[#416B34]"
              }`}
            >
              <p
                className={`py-1 border-b-2  ${
                  isActive(path.to) ? " border-[#416B34]" : "border-transparent"
                }`}
              >
                <span>{name}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
      <div className='flex gap-2 '>
        {session && (
          <Link
            to={"/settings/user/" + session._id}
            className='focus-theme rounded-full hover:underline  hover:bg-slate-100'
          >
            <div className='px-3 flex gap-2 h-full  items-center border border-slate-200 rounded-full font-medium text-xs'>
              <FontAwesomeIcon icon={faUser} />
              {session.username}
            </div>
          </Link>
        )}

        <Menu as='div' className='relative'>
          <Menu.Button className='focus-theme px-3 py-1 rounded-lg bg-slate-100 border-y border border-slate-300 hover:bg-slate-200 ui-open:bg-slate-300 disabled:opacity-70 disabled:pointer-events-none'>
            <FontAwesomeIcon icon={faBars} className='' />
          </Menu.Button>
          <Menu.Items className='absolute top-full right-0 mt-1 shadow-md rounded-lg bg-white border border-slate-200 z-30 text-sm font-medium'>
            {Object.entries(menuLinks).map(([name, link]) => (
              <Menu.Item key={name}>
                {({ active }) => (
                  <Link
                    className='px-3 py-2  hover:bg-slate-200 grid grid-cols-[16px_1fr] gap-2 items-center whitespace-nowrap text-left'
                    to={link.to}
                  >
                    <FontAwesomeIcon icon={link.icon} />
                    {name}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default AggieNavbar;
