import { isString } from "lodash";
import { Fragment } from "react";
interface IFormatOptions {}
const formatters = [
  {
    key: "username",
    desc: "format usernames with @mark",
    regex: /@[a-z0-9_]+/g,
    defaultStyle: "bg-slate-200 px-1",
  },
  {
    key: "hashtag",
    desc: "format #hastags",
    regex: /#[a-z0-9_]+/g,
    defaultStyle: "text-slate-500",
  },
];

/**
 * formats text with some css style based on formatter.
 * kinda goofy and should be rewritten if performance is an issue
 * @param text
 * @param options
 * @returns
 */
export function formatText(text: string, options: IFormatOptions = {}) {
  if (!text || !isString(text)) return text;
  const words = text.split(" ");
  let wordsToFormat = new Map();
  //match and mark words to be formatted
  // maybe this can be redone to use the built-in .match
  words.map((word, index) => {
    formatters.forEach(({ key, regex }) => {
      if (word.toLowerCase().match(regex)) {
        wordsToFormat.set(index, key);
      }
    });
  });

  return (
    <>
      {words.map((word, index) => {
        if (!wordsToFormat.has(index)) return word + " ";
        const style = formatters.find(
          (i) => i.key === wordsToFormat.get(index)
        )?.defaultStyle;
        return (
          <Fragment key={index}>
            <span className={style}>{word}</span>{" "}
          </Fragment>
        );
      })}
    </>
  );
}

export const formatAuthor = (author: string, media: string[]) => {
  if (media[0] === "twitter") return "@" + author;
  return author;
};

/**
 * convert number to pretty text
 * @param number
 * @returns
 */
export function formatNumber(number: number): string {
  return number.toLocaleString();
}

/**
 * formatted pretty string of page count
 * @param page current page
 * @param pageSize number of items per page
 * @param total total item count
 * @returns
 */
export function formatPageCount(
  page: number | undefined,
  pageSize: number,
  total: number | undefined
) {
  if (page === undefined) return "0";

  const totalCount = total !== undefined ? formatNumber(total) : "---";

  const pageCount = page * pageSize;

  const toCount = pageCount + 51 > (total || 0) ? total || 0 : pageCount + 51;

  return `${formatNumber(pageCount + 1)} — ${formatNumber(toCount)} ${
    totalCount && "of " + totalCount
  }`;
}
