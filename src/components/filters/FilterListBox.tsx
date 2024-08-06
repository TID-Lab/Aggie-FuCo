import { Listbox, RadioGroup } from "@headlessui/react";
import FilterDropdown from "./FilterDropdown";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps<T> {
  label: string;
  options: T[];
  value: T;
  onChange: (item: T) => void;
}

const FilterListBox = <T extends string>({
  label,
  options,
  value,
  onChange,
}: IProps<T>) => {
  return (
    <FilterDropdown
      label={label}
      value={value}
      onReset={() => onChange("" as T)}
    >
      {({ close }) => (
        <Listbox
          value={value}
          onChange={(e) => {
            onChange(e);
            close();
          }}
        >
          <Listbox.Options static className='divide-y divide-slate-200 m-0 p-0'>
            {options.map((item) => (
              <Listbox.Option
                value={item}
                key={item}
                className='px-2 py-1 flex justify-between items-center w-full bg-[#fff] cursor-pointer hover:bg-slate-100 ui-active:bg-slate-100'
              >
                {item}
                {value === item && (
                  <FontAwesomeIcon icon={faCheck} className='text-slate-600' />
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      )}
    </FilterDropdown>
  );
};

export default FilterListBox;
