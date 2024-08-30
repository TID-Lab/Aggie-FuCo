import type { hasId } from "./common";
import type {
  VeracityOptions,
  MediaOptions,
  IrrelevanceOptions,
} from "../api/enums";
import type { BaseMetadata } from "./metadata";

export interface Report extends hasId {
  veracity: VeracityOptions;
  tags: string[];
  smtcTags: string[];
  hasSMTCTags: boolean;
  read: boolean;
  _sources: string[];
  _media: MediaOptions[];
  _sourceNicknames: string[];
  escalated: boolean;
  _group?: string;
  authoredAt: string;
  fetchedAt: string;
  content: string;
  author: string;
  metadata: BaseMetadata;
  url: string;
  storedAt: string;
  commentTo: string;
  notes: string;
  originalPost: string;
  irrelevant?: IrrelevanceOptions;
  __v: number;
}

export interface Reports {
  total: number;
  results: Report[];
}

export interface ReportQueryState {
  keywords?: string;
  author?: string;
  groupId?: string;
  media?: string;
  sourceId?: string;
  list?: string;
  before?: Date | string;
  after?: Date | string;
  tags?: string[];
  page?: number;
}
