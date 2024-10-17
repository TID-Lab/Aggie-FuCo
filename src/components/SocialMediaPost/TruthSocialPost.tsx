import { Report } from "../../api/reports/types";
import MediaPreview from "./MediaPreview";

interface IProps {
  report: Report;
}
const TruthSocialPost = ({ report }: IProps) => {
  return (
    <>
      <div className='whitespace-pre-line break-all mb-1'>
        <p
          className='truthsocial'
          dangerouslySetInnerHTML={{
            __html: report.content,
          }}
        ></p>
      </div>

      <MediaPreview
        mediaUrl={report.metadata.mediaUrl}
        media={report._media[0]}
        report={report}
      />
    </>
  );
};

export default TruthSocialPost;
