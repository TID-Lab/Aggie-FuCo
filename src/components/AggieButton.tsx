const defaultCSS =
  "disabled:pointer-events-none disabled:opacity-50 inline-flex gap-1 items-center text-nowrap focus-theme";

const variantCSS = {
  primary:
    "bg-green-800 text-slate-100 hover:bg-green-700 rounded-lg px-2 py-1 font-medium",
  secondary:
    "bg-slate-100 px-2 py-1 hover:bg-slate-200 border border-slate-200 rounded-lg",
  outline: "",
};

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  override?: boolean;
  variant?: keyof typeof variantCSS;
}

const AggieButton = ({
  className,
  override = false,
  variant,
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
    />
  );
};

export default AggieButton;
