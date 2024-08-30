interface RawApiResponse {
  id: string;
  type: string;
  attributes: unknown;
  [key: string]: any;
}

export interface BaseMetadata {
  imageText: any;
  junkipediaId: number;
  channelId: number;
  accountHandle: string;
  accountUrl: any;
  mediaUrl: string;
  actualStatistics: Statistics;
  rawAPIResponse: RawApiResponse;
  testingFlagForPotentialDeletion: boolean;
}
export interface Statistics
  extends TwitterStatistics,
    TiktokStatistics,
    FacebookStatistics,
    YoutubeStatistics {}

export interface FacebookStatistics {
  sadCount: number;
  wowCount: number;
  careCount: number;
  hahaCount: number;
  likeCount: number;
  loveCount: number;
  angryCount: number;
  shareCount: number;
  commentCount: number;
  thankfulCount: number;
}
export interface TiktokStatistics {
  awemeId: string;
  diggCount: number;
  loseCount: number;
  playCount: number;
  shareCount: number;
  repostCount: number;
  collectCount: number;
  commentCount: number;
  forwardCount: number;
  downloadCount: number;
  loseCommentCount: number;
  whatsappShareCount: number;
}

export interface TwitterStatistics {
  like_count: number;
  view_count: string | number;
  reply_count: number;
  retweet_count: number;
}

export interface YoutubeStatistics {
  like_count: number;
  view_count: number | string;
  comment_count: number;
  dislike_count: number | null;
  favorite_count: number;
}
