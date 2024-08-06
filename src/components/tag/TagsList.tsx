import { useQuery } from "@tanstack/react-query";
import { Tag } from "../../objectTypes";
import { getTags } from "../../api/tags";

interface IProps {
  values: string[] | undefined;
}

const TagsList = ({ values }: IProps) => {
  /// do i put this here or in parent idk.
  const { isSuccess, isLoading, data } = useQuery(["tags"], getTags, {
    staleTime: 40000,
  });
  /// lol i should refactor this
  function renderTag(id: string) {
    if (isLoading || !data) return undefined;

    return data.find((i) => i._id === id);
  }
  function tagInList(id: string) {
    if (!data) return false;
    return data.some((i) => i._id === id);
  }

  if (isSuccess && values) {
    return (
      <>
        {values.map(
          (id) =>
            tagInList(id) && (
              <span
                key={id}
                className='bg-slate-200 font-medium px-2 text-slate-700 rounded-full'
              >
                {renderTag(id)?.name}
              </span>
            )
        )}
      </>
    );
  }
  return <span></span>;
};

export default TagsList;
