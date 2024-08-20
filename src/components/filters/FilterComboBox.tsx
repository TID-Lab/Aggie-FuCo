import { debounce } from "lodash";
import { useCallback, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCheck } from "@fortawesome/free-solid-svg-icons";
import FilterDropdown from "./FilterDropdown";
interface Item {
  key: string;
  value: string;
}

interface IProps {
  label: string;
  list: Item[];
  optionalItems?: Item[];
  onChange: (selectedItem: Item) => void;
  selectedKey?: string;
}

const FilterComboBox = ({
  label,
  list,
  onChange,
  selectedKey,
  optionalItems = [],
}: IProps) => {
  const [filteredList, setFilteredList] = useState(list);
  const [rawSearch, setRawSearch] = useState("");

  useEffect(() => {
    if (!list) return;
    setFilteredList(list);
  }, [list]);

  function onSearch(query: string) {
    if (!query.trim()) {
      setFilteredList(list);
      return;
    }
    const filtered = list.filter((i) =>
      i.value.toLowerCase().includes(query.trim().toLowerCase())
    );
    setFilteredList(filtered);
  }
  const doSearchInput = useCallback(debounce(onSearch, 150), [filteredList]);

  function clearSearch() {
    setRawSearch("");
    setFilteredList(list);
  }

  function onSelectItem(item: Item) {
    onChange(item);
    clearSearch();
  }
  function valueFromLists(key: string) {
    if (list.some((i) => i.key === key))
      return list.find((i) => i.key === key)?.value;
    else if (optionalItems.some((i) => i.key === key))
      return optionalItems.find((i) => i.key === key)?.value;
    return undefined;
  }
  return (
    <FilterDropdown
      label={label}
      value={selectedKey && valueFromLists(selectedKey)}
      onReset={() => onSelectItem({ key: "", value: "" })}
      headerChild={
        <>
          <input
            type='text'
            placeholder='search...'
            autoFocus={true}
            className='py-1 px-2 border border-slate-200 rounded w-full'
            value={rawSearch}
            onChange={(event) => {
              doSearchInput(event.target.value);
              setRawSearch(event.target.value);
            }}
          />
          {!!rawSearch && (
            <button
              className='px-2 mt-1 rounded hover:bg-slate-600 hover:text-slate-100 absolute right-2 text-slate-600   '
              onClick={clearSearch}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}
        </>
      }
    >
      {({ close }) => (
        <div className=' flex flex-col divide-y divide-slate-200 max-h-[15em] overflow-y-auto bg-white'>
          {!rawSearch && optionalItems.length > 0 && (
            <>
              {optionalItems.map((item) => (
                <button
                  className={`px-2 py-1 flex justify-between items-center hover:bg-slate-50 text-nowrap gap-1 ${
                    selectedKey === item.key ? "bg-slate-100" : ""
                  }`}
                  key={item.key}
                  onClick={() => {
                    onSelectItem(item);
                    close();
                  }}
                >
                  <span>{item.value}</span>
                  {selectedKey === item.key && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className='text-slate-600'
                    />
                  )}
                </button>
              ))}
              <div className='w-full h-1 bg-slate-100'></div>
            </>
          )}

          {filteredList && filteredList.length > 0 ? (
            filteredList.map((item) => (
              <button
                className={`px-2 py-1 flex justify-between items-center hover:bg-slate-50 text-nowrap gap-1 ${
                  selectedKey === item.key ? "bg-slate-100" : ""
                }`}
                key={item.key}
                onClick={() => {
                  onSelectItem(item);
                  close();
                }}
              >
                <span>{item.value}</span>
                {selectedKey === item.key && (
                  <FontAwesomeIcon icon={faCheck} className='text-slate-600' />
                )}
              </button>
            ))
          ) : (
            <div className='px-2 py-1 font-medium'> No Results Found </div>
          )}
        </div>
      )}
    </FilterDropdown>
  );
};

export default FilterComboBox;
