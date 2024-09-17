import { hasId } from "../common";

export interface Tag extends hasId {
  isCommentTag: boolean;
  name: string;
  color: string;
  description: string;
  user: {
    _id: string;
    username: string;
  };
  updatedAt: string;
  storedAt: string;
  __v: number;
  isBeingEdited?: boolean;
  isBeingEditedBy?: string;
}

export interface TagEditableData {
  name: string;
  description?: string;
  isCommentTag: boolean;
  color: string;
  _id?: string;
  isBeingEdited?: boolean;
  isBeingEditedBy?: string;
}
