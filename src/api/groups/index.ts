// Or known on the backend as groups.
import axios from "axios";
import {
  Group,
  GroupEditableData,
  Groups,
  GroupQueryState,
  GroupComment,
  EditableGroupComment,
} from "./types";
import type { GroupSearchState } from "../../objectTypes";
import type { Reports } from "../reports/types";
import { hasId, VeracityOptions } from "../common";
import { omitBy, isNil } from "lodash";

export const getGroups = async (
  searchState: GroupQueryState = {},
  tagIds: hasId[] = []
) => {
  const queryState = urlFromQuery(searchState, tagIds);
  if (queryState != "") {
    const { data } = await axios.get<Groups | undefined>(
      "/api/group?" + queryState
    );
    return data;
  } else {
    const { data } = await axios.get<Groups | undefined>("/api/group");
    return data;
  }
};

// todo: depreacate
export const getGroups_old = async (
  searchState: GroupSearchState = {},
  tagIds: hasId[] = []
) => {
  if (generateGroupsSearchURL(searchState, tagIds) != "") {
    const { data } = await axios.get<Groups | undefined>(
      "/api/group?" + generateGroupsSearchURL(searchState, tagIds)
    );
    return data;
  } else {
    const { data } = await axios.get<Groups | undefined>("/api/group");
    return data;
  }
};

const defaultAllGroups = {
  lean: "true",
};

export const getAllGroups = async (
  options: Partial<typeof defaultAllGroups> = defaultAllGroups
) => {
  options = { ...defaultAllGroups, ...options };
  const params = new URLSearchParams(options);
  const { data } = await axios.get<
    Pick<Group, "title" | "_id">[] | Groups | undefined
  >("/api/group/all?" + params.toString());

  return data;
};

export const getGroup = async (id: string | undefined) => {
  if (id) {
    const { data } = await axios.get<Group | undefined>("/api/group/" + id);
    return data;
  }
};
// todo: remove when refactor
export const getGroup_untyped = async (id: string | undefined) => {
  if (id) {
    const { data } = await axios.get("/api/group/" + id);
    return data;
  }
};

export const newGroup = async (groupData: Partial<GroupEditableData>) => {
  const { data } = await axios.post<Group>("/api/group", groupData);
  return data;
};

export const editGroup = async (group: Group | Partial<GroupEditableData>) => {
  const updateValues = omitBy(group, (v) => isNil(v) || v === "");
  console.log(updateValues);

  const { data } = await axios.put<Group>(
    "/api/group/" + group._id,
    updateValues
  );
  return data;
};
//TODO: deprecate
export const editGroup_old = async (group: Group | GroupEditableData) => {
  const { data } = await axios.put("/api/group/" + group._id, group);
  return data;
};
export const deleteGroup = async (group: Group) => {
  const { data } = await axios.delete("/api/group/" + group._id);
  return data;
};

export const getGroupReports = async (
  groupId: string | undefined,
  page: number
) => {
  if (groupId) {
    const { data } = await axios.get<Reports | undefined>(
      "/api/report?groupId=" + groupId + "&page=" + page
    );
    return data;
  }
};

// todo: remove when refactor
export const getGroupReports_untyped = async (
  groupId: string | undefined,
  page: number
) => {
  if (groupId) {
    const { data } = await axios.get(
      "/api/report?groupId=" + groupId + "&page=" + page
    );
    return data;
  }
};

export const setSelectedVeracity = async (
  groupIds: string[],
  veracity: VeracityOptions | string
) => {
  const { data } = await axios.patch("/api/group/_veracity", {
    ids: groupIds,
    veracity: veracity,
  });
  return data;
};

export const setSelectedEscalated = async (
  groupIds: string[],
  escalated: boolean
) => {
  const { data } = await axios.patch("/api/group/_escalated", {
    ids: groupIds,
    escalated: escalated,
  });
  return data;
};

export const setSelectedClosed = async (
  groupIds: string[],
  closed: boolean
) => {
  const { data } = await axios.patch("/api/group/_closed", {
    ids: groupIds,
    closed: closed,
  });
  return data;
};

export const setSelectedTitle = async (groupIds: string[], title: string) => {
  const { data } = await axios.patch("/api/group/_title", {
    ids: groupIds,
    title: title,
  });
  return data;
};

export const setSelectedNotes = async (groupIds: string[], notes: string) => {
  const { data } = await axios.patch("/api/group/_notes", {
    ids: groupIds,
    notes: notes,
  });
  return data;
};

export const addComment = async (params: {
  groupId: string | undefined;
  comment: EditableGroupComment;
}) => {
  if (!params.groupId) return undefined;
  const { data } = await axios.patch("/api/group/_comment_add", {
    ids: [params.groupId],
    comment: params.comment,
  });
  return data;
};
export const editComment = async (params: {
  groupId: string | undefined;
  comment: EditableGroupComment;
}) => {
  if (!params.groupId) return undefined;
  const { data } = await axios.patch("/api/group/_comment_update", {
    ids: [params.groupId],
    comment: params.comment,
  });
  return data;
};
export const removeComment = async (params: {
  groupId: string | undefined;
  comment: EditableGroupComment | GroupComment;
}) => {
  if (!params.groupId) return undefined;
  const { data } = await axios.patch("/api/group/_comment_remove", {
    ids: [params.groupId],
    comment: params.comment,
  });
  return data;
};

export const setSelectedLocationName = async (
  groupIds: string[],
  locationName: string
) => {
  const { data } = await axios.patch("/api/group/_locationName", {
    ids: groupIds,
    locationName: locationName,
  });
  return data;
};

/**
 * todo: get rid of tagId? i dont see why this needs to be separated
 * @param queryState
 * @param tagIds
 */
function urlFromQuery(queryState: GroupQueryState, tagIds: hasId[]) {
  const url = new URLSearchParams();
  // i think ideally GroupQueryState should convert to record<string,string>
  Object.entries(queryState).forEach(([key, value]) => {
    //overrides:
    if (key === "locationName") {
      url.set("location", value);
    } else {
      url.set(key, value);
    }
    console.log(key, value);
  });
  if (tagIds && tagIds.length > 0) {
    url.set("tags", tagIds.toString());
  }
  return url.toString();
}

//TODO: refactor with URLSearchParam Object
const generateGroupsSearchURL = (
  searchState: GroupSearchState,
  tagIds: hasId[]
) => {
  let url = "";
  if (tagIds.length > 0) {
    url += "tags=" + tagIds;
  }
  if (searchState.title) {
    if (url === "") url += "title=" + searchState.title;
    else url += "&title=" + searchState.title;
  }
  if (searchState.creator) {
    if (url === "") url += "creator=" + searchState.creator;
    else url += "&creator=" + searchState.creator;
  }
  if (searchState.idnum) {
    if (url === "") url += "idnum=" + searchState.idnum;
    else url += "&idnum=" + searchState.idnum;
  }
  if (searchState.locationName) {
    if (url === "") url += "location=" + searchState.locationName;
    else url += "&location=" + searchState.locationName;
  }
  if (searchState.assignedTo) {
    if (url === "") url += "assignedTo=" + searchState.assignedTo;
    else url += "&assignedTo=" + searchState.assignedTo;
  }
  if (searchState.veracity) {
    if (url === "") url += "veracity=" + searchState.veracity;
    else url += "&veracity=" + searchState.veracity;
  }
  if (searchState.totalReports) {
    if (url === "") url += "totalReports=" + searchState.totalReports;
    else url += "&totalReports=" + searchState.totalReports;
  }
  if (searchState.closed) {
    if (url === "") url += "closed=" + searchState.closed;
    else url += "&closed=" + searchState.closed;
  }

  if (searchState.escalated) {
    if (url === "") url += "escalated=" + searchState.escalated;
    else url += "&escalated=" + searchState.escalated;
  }

  if (searchState.before) {
    if (url === "") url += "before=" + searchState.before;
    else url += "&before=" + searchState.before;
  }
  if (searchState.after) {
    if (url === "") url += "after=" + searchState.after;
    else url += "&after=" + searchState.after;
  }

  if (searchState.page) {
    if (url === "") url += "page=" + searchState.page;
    else url += "&page=" + searchState.page;
  }
  return url;
};
