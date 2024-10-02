/**
 * parsing the mess of metadata that we get from various sources.
 * this is a very trial-and-error process.
 */
import { Report, TwitterStatistics } from "../../api/reports/types";

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
