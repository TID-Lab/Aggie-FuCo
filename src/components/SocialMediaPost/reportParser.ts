/**
 * parsing the mess of metadata that we get from various sources.
 * this is a very trial-and-error process.
 */
import {
  BaseMetadata,
  Report,
  TwitterStatistics,
} from "../../api/reports/types";
//import sanitizeHtml from "sanitize-html";
import { MediaOptions } from "../../api/common";

type ContentType =
  | "default"
  | "twitterQuote"
  | "twitterRetweet"
  | "truthsocial";

export function parseContentType(
  _media: MediaOptions[],
  metadata: BaseMetadata
): ContentType {
  if (!_media) return "default";
  if (_media[0] === "truthsocial") return "truthsocial";
  if (_media[0] !== "twitter") return "default";
  const rawPostData = (metadata.rawAPIResponse.attributes as any)?.post_data;
  if (!rawPostData) return "default";
  const isQuoteRetweet = rawPostData.quoted_status_result?.result;
  if (isQuoteRetweet) {
    return "twitterQuote";
  }
  const isRetweet = rawPostData.retweeted_status_result?.result;
  if (isRetweet) {
    return "twitterRetweet";
  }
  return "default";
}

export function parseTwitterUser(rawPostData: any) {
  const userData = rawPostData?.core?.user_results?.result?.legacy;
  if (!userData) return undefined;
  return {
    name: userData.name,
    username: userData.screen_name,
    followers: userData.followers_count,
    url: userData.url,
    createdAt: userData.created_at,
  };
}

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

export function parseTwitterRetweet(report: Report) {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.post_data;
  const retweetResult = rawPostData?.retweeted_status_result?.result;

  const innerAuthor = parseTwitterUser(retweetResult);

  const statistics: TwitterStatistics = {
    reply_count: retweetResult.legacy?.reply_count,
    retweet_count:
      retweetResult.legacy?.retweet_count + retweetResult.legacy?.quote_count,
    like_count: retweetResult.legacy?.favorite_count,
    view_count: retweetResult.views?.count,
  };

  return {
    author: innerAuthor,
    authoredAt: retweetResult.legacy?.created_at,
    content: retweetResult.legacy?.full_text,
    statistics,
  };
}

export function parseTwitterQuote(report: Report) {
  const rawPostData = (report.metadata.rawAPIResponse.attributes as any)
    ?.post_data;
  const quotedResult = rawPostData.quoted_status_result?.result;

  const innerAuthor = parseTwitterUser(quotedResult);

  const statistics: TwitterStatistics = {
    reply_count: quotedResult.legacy?.reply_count,
    retweet_count:
      quotedResult.legacy?.retweet_count + quotedResult.legacy?.quote_count,
    like_count: quotedResult.legacy?.favorite_count,
    view_count: quotedResult.views?.count,
  };

  return {
    author: innerAuthor,
    authoredAt: quotedResult.legacy?.created_at,
    content: quotedResult.legacy?.full_text,
    statistics,
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
