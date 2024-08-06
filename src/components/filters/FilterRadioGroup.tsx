import { RadioGroup } from "@headlessui/react";

interface IProps<T> {
  options: T[];
  value: T;
  defaultOption?: string;
  onChange: (value: T) => void;
}

const FilterRadioGroup = <T extends string>({
  options,
  value,
  defaultOption,
  onChange,
}: IProps<T>) => {
  const OptionStyle =
    "ui-not-checked:px-1 py-1 hover:bg-slate-100 rounded cursor-pointer hover:underline transition";
  const OptionCheckedStyle =
    "ui-checked:px-2 ui-checked:pointer-events-none ui-checked:font-medium ui-checked:text-black ui-checked:bg-slate-200 ";
  return (
    <RadioGroup
      className='flex items-center gap-1  text-slate-700  underline-offset-2 font-normal'
      value={value ? value : ""}
      onChange={onChange}
    >
      {defaultOption && (
        <RadioGroup.Option
          value={""}
          key=''
          className={`${OptionStyle} ${OptionCheckedStyle}`}
        >
          {defaultOption}
        </RadioGroup.Option>
      )}
      {options.map((option) => (
        <RadioGroup.Option
          value={option}
          key={option}
          className={`${OptionStyle} ${OptionCheckedStyle}`}
        >
          {option}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};

export default FilterRadioGroup;
