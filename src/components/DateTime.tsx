import ReactTimeAgo from "react-time-ago";
import { stringToDate } from "../helpers";

const DateTime = ({ dateString }: { dateString: string }) => {
  function timeOrDate(datestring: string) {
    const date = stringToDate(datestring);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth()
    )
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return date.toLocaleDateString();
  }

  return (
    <>
      <span className='font-medium'>
        <ReactTimeAgo
          date={stringToDate(dateString)}
          locale='en-US'
          timeStyle='twitter'
        />
      </span>{" "}
      ({timeOrDate(dateString)})
    </>
  );
};

export default DateTime;
