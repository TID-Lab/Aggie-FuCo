import { useSearchParams } from "react-router-dom";

/**
 *  common query search parameter functions
 *
 * */
export function useQueryParams<T extends object>() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getAllParams = (): T => {
    const params = searchParams.entries();
    let paramObject = {};
    for (const [key, value] of params) {
      paramObject = { ...paramObject, [key]: value };
    }
    return paramObject as T;
  };
  const getParam = (key: keyof T): string => {
    const get = searchParams.get(key as string);
    if (get === null) return "";
    return get;
  };
  const setParams = (values: T) => {
    Object.entries(values).forEach(([key, value]) => {
      if (!value || value === "") searchParams.delete(key);
      else searchParams.set(key, value as string);
    });

    setSearchParams(searchParams);
  };

  return { searchParams, getAllParams, setParams, getParam };
}
