import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cssBase = "px-2 font-medium items-center ";

const variants = {
  "light:red": "bg-red-200 text-red-800",
  "dark:red": "text-red-50 bg-red-600",
  "light:amber": "bg-amber-200 text-amber-800",
};

interface IProps {
  icon?: IconProp;
  className?: string;
  variant?: keyof typeof variants;
  children: React.ReactNode;
}

const AggieToken = ({ children, icon, className = "", variant }: IProps) => {
  return (
    <span
      className={`flex gap-1 ${className} ${
        variant ? variants[variant] + " " + cssBase : ""
      }`}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </span>
  );
};

export default AggieToken;
