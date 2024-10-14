import { Report } from "../../api/reports/types";
import { parseYoutube } from "./reportParser";

interface IProps {
  report: Report;
}
const YoutubePost = ({ report }: IProps) => {
  const { title, description } = parseYoutube(report);

  return <></>;
};

export default YoutubePost;
