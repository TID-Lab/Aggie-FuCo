import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultCSS =
  "disabled:pointer-events-none disabled:opacity-50 inline-flex gap-1 items-center text-nowrap focus-theme font-medium";

export const VariantCSS = {
  primary:
    "bg-green-800 text-slate-100 hover:bg-green-700 border border-green-600 rounded-lg ",
  secondary:
    "bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg",
  transparent: "hover:bg-slate-200 hover:underline  rounded-lg",
  danger: "bg-red-700 text-white hover:bg-red-600 rounded-lg ",
  warning: "bg-red-200 text-red-700 hover:bg-red-300 rounded-lg",
};

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  override?: boolean;
  variant?: keyof typeof VariantCSS;
  padding?: string;
  loading?: boolean;
  icon?: IconProp;
}

const AggieButton = ({
  className,
  override = false,
  loading = false,
  variant,
  padding,
  icon,
  children,
  ...props
}: IProps) => {
  return (
    <button
      className={
        override
          ? className
          : `${defaultCSS} ${padding ? padding : "px-2 py-1"} ${className} ${
              variant ? VariantCSS[variant] : ""
            }`
      }
      {...props}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} className={"animate-spin"} />
      ) : (
        !!icon && <FontAwesomeIcon icon={icon} />
      )}
      {children}
    </button>
  );
};

export default AggieButton;
