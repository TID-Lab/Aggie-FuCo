import { debounce } from "lodash";
import { useCallback, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faCheckCircle,
  faSortDown,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { Popover } from "@headlessui/react";

interface Item {
  key: string;
  value: string;
}

interface IProps {
  label?: string;
  list: Item[];
  onChange: (selectedItem: Item) => void;
  selectedItem?: Item;
}

const ComboBox = ({ label, list, onChange, selectedItem }: IProps) => {
  const [filteredList, setFilteredList] = useState(list);
  const [rawSearch, setRawSearch] = useState("");

  useEffect(() => {
    if (!list) return;
    setFilteredList(list);
  }, [list]);

  function onSearch(query: string) {
    if (!query.trim()) setFilteredList(list);
    const filtered = filteredList.filter((i) =>
      i.value.toLowerCase().includes(query.trim().toLowerCase())
    );
    setFilteredList(filtered);
  }
  const doSearchInput = useCallback(debounce(onSearch, 300), []);

  function onSelectItem(item: Item) {
    onChange(item);
    clearSearch();
  }
  function clearSearch() {
    setRawSearch("");
    setFilteredList(list);
  }
  const hasSelection = !!selectedItem && !!selectedItem.key;
  return (
    <Popover className='relative'>
      <Popover.Button
        className={`py-1 px-2 hover:bg-slate-200 ui-open:bg-slate-100 rounded ${
          hasSelection ? "bg-slate-200" : ""
        }`}
      >
        <FontAwesomeIcon
          icon={faCaretDown}
          className='ui-open:rotate-180 mr-1'
        />

        {hasSelection ? selectedItem.value : label}
      </Popover.Button>
      <Popover.Panel className='absolute rounded-lg border border-slate-200  bg-slate-100 overflow-hidden'>
        {({ close }) => (
          <>
            <header className='py-1 px-1 border-b border-slate-300 relative'>
              <h3 className='text-sm font-medium mb-1 ml-1'>{label}</h3>
              <input
                type='text'
                placeholder='search...'
                className='p-1  border border-slate-200 rounded'
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
            </header>

            <div className=' flex flex-col divide-y divide-slate-200 max-h-[12em] overflow-y-auto bg-white'>
              {filteredList &&
                filteredList.map((item) => (
                  <button
                    className={`px-2 py-1 flex justify-between hover:bg-slate-50 ${
                      selectedItem?.key === item.key ? "bg-slate-100" : ""
                    }`}
                    key={item.key}
                    onClick={() => {
                      onSelectItem(item);
                      close();
                    }}
                  >
                    <span>{item.value}</span>
                    {selectedItem?.key === item.key && (
                      <FontAwesomeIcon icon={faCheckCircle} />
                    )}
                  </button>
                ))}
            </div>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export default ComboBox;
