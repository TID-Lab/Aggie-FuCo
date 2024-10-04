// refactor with floating-ui

import React from "react";
import { GeneratedTags } from "../api/reports/types";
import { isBoolean } from "lodash";
const starIcon = (
  <svg
    width='16'
    height='16'
    fill='none'
    className='text-purple-600'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M9.346 3.114c.093-.321.549-.321.641 0l.953 3.315c.03.107.112.191.218.225l3.19 1.029c.309.099.309.535 0 .634l-3.19 1.029a.333.333 0 0 0-.218.225l-.953 3.315c-.092.321-.548.321-.64 0L8.392 9.57a.333.333 0 0 0-.218-.225l-3.19-1.029a.333.333 0 0 1 0-.634l3.19-1.029a.333.333 0 0 0 .218-.225l.953-3.315ZM3.348 2.381a.333.333 0 0 1 .638 0l.329 1.082c.032.107.116.19.222.222l1.082.33a.333.333 0 0 1 0 .637l-1.082.33a.333.333 0 0 0-.222.222l-.33 1.082a.333.333 0 0 1-.637 0l-.33-1.082a.333.333 0 0 0-.221-.222l-1.083-.33a.333.333 0 0 1 0-.637l1.083-.33a.333.333 0 0 0 .221-.222l.33-1.082ZM4.681 10.381a.333.333 0 0 1 .638 0l.33 1.082c.032.107.115.19.221.222l1.082.33a.333.333 0 0 1 0 .637l-1.082.33a.333.333 0 0 0-.222.222l-.33 1.082a.333.333 0 0 1-.637 0l-.33-1.082a.333.333 0 0 0-.221-.222l-1.082-.33a.333.333 0 0 1 0-.637l1.082-.33a.333.333 0 0 0 .222-.222l.33-1.082Z'
      fill='currentColor'
    />
  </svg>
);

const keyClass = "pl-1 pr-2 flex items-center gap-1 rounded-full font-medium";

interface IProps {
  tags?: GeneratedTags;
  showCount?: number;
  tempHoverCSS?: string;
}
const GeneratedTagsList = ({
  tags,
  showCount = 2,
  tempHoverCSS = "left-0",
}: IProps) => {
  if (!tags) return <></>;

  const tagsList = Object.entries(tags).map(([key, value]) => {
    return {
      key: key.replaceAll("_", " "),
      ...value,
    };
  });
  if (!tagsList) return <></>;

  const booleanTagsList = tagsList.filter((i) => isBoolean(i.value) && i.value);
  const moreTagsLength =
    booleanTagsList.length > 1 ? tagsList.length - 2 : tagsList.length - 1;
  return (
    <>
      {booleanTagsList?.slice(0, showCount).map((item) => (
        <span
          key={item.key}
          className={`${keyClass} bg-purple-200  text-purple-900 group/gen relative`}
        >
          {starIcon}
          {item.key}
          <span
            className={`${tempHoverCSS} group-hover/gen:opacity-100 absolute mt-1 top-full rounded p-3 inline-block opacity-0 pointer-events-none z-10 bg-purple-50 border border-purple-400 min-w-20 w-max max-w-md `}
          >
            <span className='block '>
              {item.key}
              {isBoolean(item.value) ? (
                <span className='rounded-full px-2 bg-purple-600 text-white'>
                  {`${item.value}`}
                </span>
              ) : (
                <span className='block font-medium'>{item.value}</span>
              )}
            </span>
            <span className='block mb-1 text-xs italic'>{item.rationale}</span>
          </span>
        </span>
      ))}
      {tagsList.length > showCount && (
        <span
          className={`${keyClass} group/gen hover:bg-purple-300 bg-purple-200 border border-purple-400 text-purple-900 relative`}
        >
          {starIcon} +{moreTagsLength}
          <span
            className={`${tempHoverCSS} group-hover/gen:opacity-100 absolute mt-1 top-full rounded p-3 inline-block opacity-0 pointer-events-none z-10 bg-purple-50 border border-purple-400 min-w-20 w-max max-w-md `}
          >
            {tagsList.map((item) => (
              <React.Fragment key={item.key}>
                <span className='block '>
                  {item.key}{" "}
                  {isBoolean(item.value) ? (
                    <span className='rounded-full px-2 bg-purple-600 text-white'>
                      {`${item.value}`}
                    </span>
                  ) : (
                    <span className='block font-medium'>{item.value}</span>
                  )}
                </span>
                <span className='block mb-1 text-xs italic'>
                  {item.rationale}
                </span>
              </React.Fragment>
            ))}
          </span>
        </span>
      )}
    </>
  );
};

export default GeneratedTagsList;
