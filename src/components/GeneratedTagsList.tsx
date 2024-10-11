// refactor with floating-ui

import React from "react";
import { GeneratedTags } from "../api/reports/types";
import { isBoolean } from "lodash";
import GeneratedTag from "./GeneratedTag";

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

  const tagsList = Object.entries(tags).filter(
    ([key, value]) => !key.includes("rationale")
  );

  if (!tagsList) return <></>;
  const keyClass = "pl-1 pr-2 flex items-center gap-1 rounded-full font-medium";

  const booleanTagsList = tagsList
    .filter(([key, value]) => isBoolean(value) && value)
    .slice(0, showCount);
  const moreTagsLength = tagsList.length - booleanTagsList.length;
  return (
    <>
      {booleanTagsList?.map(([key, value]) => (
        <GeneratedTag name={key.replaceAll("_", " ")} key={key.replaceAll("_", " ")}>
          <span className='block '>
            {key.replaceAll("_", " ")}
            {isBoolean(value) ? (
              <span className='rounded-full px-2 bg-purple-600 text-white'>
                {`${value}`}
              </span>
            ) : (
              <span className='block font-medium'>{value}</span>
            )}
          </span>
          <span className='block mb-1 text-xs italic'>{value}</span>
        </GeneratedTag>
      ))}
      {moreTagsLength > 0 && (
        <GeneratedTag
          name={`+${moreTagsLength}`}
          className='rounded-full hover:bg-purple-100  text-purple-900 border border-purple-400'
        >
          <div className='divide-y divide-purple-400'>
            {tagsList.map(([key, value]) => (
              <div key={key} className='py-1'>
                <span className='block '>
                  {key.replaceAll("_", " ")}{" "}
                  {isBoolean(value) ? (
                    <span className='rounded-full px-2 bg-purple-600 text-white'>
                      {`${value}`}
                    </span>
                  ) : (
                    <span className='block font-medium'>{value}</span>
                  )}
                </span>
                <span className='block mb-1 text-xs italic'>
                  {`${key}_rationale` in tags && tags[`${key}_rationale`]}
                </span>
              </div>
            ))}
          </div>
        </GeneratedTag>
      )}
    </>
  );
};

export default GeneratedTagsList;
