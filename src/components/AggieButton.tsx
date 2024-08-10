const defaultCSS =
  "disabled:pointer-events-none disabled:opacity-50 flex gap-1 items-center text-nowrap ";

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  override?: boolean;
}

const AggieButton = ({ className, override = false, ...props }: IProps) => {
  return (
    <button
      className={override ? className : `${defaultCSS} ${className}`}
      {...props}
    />
  );
};

export default AggieButton;
