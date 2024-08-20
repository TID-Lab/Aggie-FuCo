import { isString } from "lodash";

export function formatHashtag(word: unknown, className = "", index = 0) {
  if (!isString(word)) return word;
  const matchHashtag = word.toLowerCase().match(/#[a-z0-9_]+/g);
  if (matchHashtag) {
    return (
      <span
        key={word + index.toString()}
        className={className ? className : "text-slate-500"}
      >
        {word + " "}
      </span>
    );
  }
  return word + " ";
}

export const formatAuthor = (author: string, media: string[]) => {
  if (media[0] === "twitter") return "@" + author;
  return author;
};
