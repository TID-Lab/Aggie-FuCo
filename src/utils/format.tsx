import { isString } from "lodash";

export function formatHashtag(word: unknown, className = "") {
  if (!isString(word)) return word;
  const matchHashtag = word.toLowerCase().match(/#[a-z0-9_]+/g);
  if (matchHashtag) {
    return (
      <span className={className ? className : "text-slate-500"}>
        {word + " "}
      </span>
    );
  }
  return word + " ";
}
