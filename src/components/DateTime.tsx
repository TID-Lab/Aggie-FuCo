import ReactTimeAgo from "react-time-ago";
import { stringToDate } from "../helpers";

interface IPropsDateString {
  dateString: string | undefined;
  date?: never;
}
interface IPropsDate {
  dateString?: never;
  date: Date | undefined;
}
type IProps = IPropsDate | IPropsDateString;
const DateTime = (props: IProps) => {
  const date =
    "date" in props && !!props.date
      ? props.date
      : stringToDate(props.dateString || "");

  if (!date) return <></>;
  console.log(date);
  function timeOrDate(d: Date) {
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth())
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return d.toLocaleDateString();
  }

  return (
    <>
      <span className='font-medium'>
        <ReactTimeAgo date={date} locale='en-US' timeStyle='twitter' />
      </span>{" "}
      ({timeOrDate(date)})
    </>
  );
};

export default DateTime;
