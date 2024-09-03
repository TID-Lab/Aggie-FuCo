import { useState } from "react";
import { MediaOptions } from "../../api/common";
import { Report } from "../../api/reports/types";
import YouTube, { YouTubeProps } from "react-youtube";

interface IProps {
  mediaUrl: string;
  media: MediaOptions;
  report: Report;
}
const MediaPreview = ({ mediaUrl, media, report }: IProps) => {
  const [loaded, setLoaded] = useState(false);

  if (!mediaUrl) return <></>;
  switch (media) {
    case "youtube":
      return (
        <div className='w-full aspect-video overflow-hidden rounded'>
          <YoutubeVideo src={report.url} />{" "}
        </div>
      );
    default:
      return (
        <div className='min-h-[30vh] relative'>
          {!loaded && (
            <div className='absolute inset-0 z-10 rounded bg-slate-50 grid place-items-center'>
              Loading Image...
            </div>
          )}
          <img
            className='w-full h-auto rounded'
            src={mediaUrl}
            onLoad={() => setLoaded(true)}
          />
        </div>
      );
  }
};
export default MediaPreview;

const YoutubeVideo = (props: { src: string }) => {
  // i stole this from https://github.com/jmorrell/get-youtube-id
  function parseUrl(url: string) {
    const patterns = [
      /youtu\.be\/([^#\&\?]{11})/, // youtu.be/<id>
      /\?v=([^#\&\?]{11})/, // ?v=<id>
      /\&v=([^#\&\?]{11})/, // &v=<id>
      /embed\/([^#\&\?]{11})/, // embed/<id>
      /\/v\/([^#\&\?]{11})/, // /v/<id>
    ];

    // If any pattern matches, return the ID
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        const result = pattern.exec(url);
        if (!result) return undefined;
        return result[1];
      }
    }
    return undefined;
  }
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    //   playerVars: {
    //     // https://developers.google.com/youtube/player_parameters
    //     autoplay: 0,
    //   },
  };

  const id = parseUrl(props.src);
  if (!id) return <></>;
  return (
    <YouTube
      videoId={id}
      opts={opts}
      onReady={onPlayerReady}
      className='h-full w-full'
    />
  );
};
