import _ from "lodash";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 *  common query search parameter functions
 *  
 * */ 
export function useQueryParams<Type extends object>() {
    const [searchParams, setSearchParams] = useSearchParams();
   
    const getAllParams = (): Type => {
        const params = searchParams.entries();
        let paramObject = {};
        for (const [key, value] of params) {
          paramObject = { ...paramObject, [key]: value };
        }
        return paramObject as Type;
      }
      const getParam = (key:string): string => {
        const get = searchParams.get(key)
        if (get === null) return ""
        return get
         
      }
    const setParams = (values: Type)  => {
        // remove empty keys
        const cleanQuery = _.omitBy(
          values,
          (v) => _.isUndefined(v) 
          || _.isNull(v) 
          //@ts-ignore
          || v === ""
        );
        setSearchParams({
          ...searchParams,
          ...cleanQuery,
        });
    }
      
    return {searchParams,getAllParams,setParams, getParam}
}