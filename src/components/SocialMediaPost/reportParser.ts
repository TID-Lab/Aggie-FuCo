/**
 * parsing the mess of metadata that we get from various sources.
 * this is a very trial-and-error process.
 * would love to refactor this into something that makes more sense
 */
import {
  BaseMetadata,
  Report,
  TwitterStatistics,
} from "../../api/reports/types";
//import sanitizeHtml from "sanitize-html";
import { MediaOptions } from "../../api/common";

// key for custom parsing, default means i dont have a specialized parser for this

type ContentType =
  | "default"
  | "twitter"
  | "twitter:retweet"
  | "truthsocial"
  | "youtube";

export function parseContentType(report: Report): ContentType {
  if (!report._media) return "default";
  if (report._media[0] === "truthsocial") return "truthsocial";
  if (report._media[0] === "youtube") return "youtube";
  if (report._media[0] === "twitter") {
    if (isRetweet(report)) return "twitter:retweet";
    return "twitter";
  }

  return "default";
}
export const isQuoteRetweet = (report: Report) =>
  !!(report.metadata.rawAPIResponse.attributes as any)?.post_data
    .quoted_status_result?.result;

export const isRetweet = (report: Report) =>
  !!(report.metadata.rawAPIResponse.attributes as any)?.post_data
    .retweeted_status_result?.result;

export function isTwitterReply(report: Report) {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.post_data;
  const name = rawPostData?.in_reply_to_screen_name;
  const id = rawPostData?.in_reply_to_status_id_str;
  return {
    author: name,
    url: !!name && !!id ? `https://x.com/${name}/status/${id}` : undefined,
  };
}

export function getTweetImages(report: Report) {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.search_data_fields;

  const images = rawPostData?.media_data?.map((imgData: any) => {
    return imgData.thumb_url + "?format=jpg&name=medium";
  });
  return images as string[];
}

export function parseYoutube(report: Report) {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.post_data;
  const youtubeData = rawPostData.snippet.data;
  return {
    title: youtubeData.title,
    description: youtubeData.description,
  };
}
// temporary, should be done server-side
export function sanitize(string: string) {
  return string;
  // return sanitizeHtml(string, {
  //   allowedAttributes: {
  //     ...sanitizeHtml.defaults.allowedAttributes,
  //     span: ["class"],
  //   },
  //});
}
