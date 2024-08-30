import { Report } from "../../types/reports";

export const reportAuthorUrl = (report: Report) => {
  if (report.metadata.accountUrl) {
    return report.metadata.accountUrl;
  } else {
    // Twitter
    return "https://twitter.com/" + report.author;
  }
};

/**
 * This function returns the full text content of a social media post.
 * @param report to return the full text of
 * @returns fullText of the social media post
 */
export const reportFullContent = (report: Report): string => {
  if (report.metadata && report.metadata.rawAPIResponse) {
    if (report.metadata.rawAPIResponse.extended_tweet) {
      return report.metadata.rawAPIResponse.extended_tweet.full_text;
    } else if (report.metadata.rawAPIResponse.retweeted_status) {
      if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet) {
        if (
          report.metadata.rawAPIResponse.retweeted_status.extended_tweet
            .full_text
        ) {
          return report.metadata.rawAPIResponse.retweeted_status.extended_tweet
            .full_text;
        }
      }
    }
  }
  return report.content;
};
