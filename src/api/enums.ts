export const VERACITY_OPTIONS = [
  "Unconfirmed",
  "Confirmed False",
  "Confirmed True",
] as const;
export type VeracityOptions = (typeof VERACITY_OPTIONS)[number];

export const ESCALATED_OPTIONS = ["true", "false"] as const;
export type EscalatedOptions = (typeof ESCALATED_OPTIONS)[number];

export const CLOSED_OPTIONS = ["true", "false"] as const;
export type ClosedOptions = (typeof CLOSED_OPTIONS)[number];

const MEDIA_OPTIONS = [
  "twitter",
  "instagram",
  "RSS",
  "elmo",
  "SMS GH",
  "facebook",
];
export type MediaOptions = (typeof MEDIA_OPTIONS)[number];
