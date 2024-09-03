import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultCSS =
  "disabled:pointer-events-none disabled:opacity-50 inline-flex gap-1 items-center text-nowrap focus-theme font-medium";

const variantCSS = {
  primary:
    "bg-green-800 text-slate-100 hover:bg-green-700 rounded-lg px-2 py-1 ",
  secondary:
    "bg-slate-100 px-2 py-1 hover:bg-slate-200 border border-slate-200 rounded-lg",
  outline: "",
};

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  override?: boolean;
  variant?: keyof typeof variantCSS;
  loading?: boolean;
}

const AggieButton = ({
  className,
  override = false,
  loading = false,
  variant,
  children,
  ...props
}: IProps) => {
  return (
    <button
      className={
        override
          ? className
          : `${defaultCSS} ${className} ${variant ? variantCSS[variant] : ""}`
      }
      {...props}
    >
      {loading && <FontAwesomeIcon icon={faSpinner} className='animate-spin' />}
      {children}
    </button>
  );
};

export default AggieButton;
