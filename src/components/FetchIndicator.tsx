import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

type IState = "loading" | "finished" | "idle";

const FetchIndicator = () => {
  const [fetchState, setFetchState] = useState<IState>("idle");
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  function onFetchState() {
    if (fetchState === "finished") return;
    setFetchState("finished");
    setTimeout(() => {
      setFetchState("idle");
    }, 1000);
  }
  const doOnFetchState = useCallback(debounce(onFetchState, 150), [fetchState]);

  useEffect(() => {
    if (isFetching + isMutating === 0) doOnFetchState();
    else setFetchState("loading");
  }, [isFetching, isMutating]);
  function setWidth(value: number, state: IState) {
    if (value === 0 && state === "idle") return 0;
    // lol...

    const width = 75 / (value + 1) + 25;
    return state === "finished" ? 100 : width;
  }
  return (
    <div className='w-full h-1 pointer-events-none sticky top-0 z-50 '>
      <span
        className='h-1 absolute top-0 left-0 transition duration-800 bg-blue-600'
        style={{
          width: `${setWidth(isFetching + isMutating, fetchState)}%`,
        }}
      ></span>
    </div>
  );
};
export default FetchIndicator;
