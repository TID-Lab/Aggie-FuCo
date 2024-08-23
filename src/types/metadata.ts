export interface Metadata {
  imageText: any;
  junkipediaId: number;
  channelId: number;
  accountHandle: string;
  accountUrl: any;
  mediaUrl: string;
  actualStatistics: FacebookStatistics | TiktokStatistics | TwitterStatistics;
  rawAPIResponse: RawApiresponse;
  testingFlagForPotentialDeletion: boolean;
}

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
  view_count: string;
  reply_count: number;
  retweet_count: number;
}

export interface RawApiresponse {
  id: string;
  type: string;
  attributes: unknown;
}
