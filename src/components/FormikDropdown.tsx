import { useField } from "formik";

import {
  faCheck,
  faChevronDown,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox } from "@headlessui/react";

interface IProps {
  label: string;
  name: string;
  list: { _id: string; label: string }[];
  disabled?: boolean;
}
const FormikDropdown = ({ label, name, list, disabled = false }: IProps) => {
  const [field, meta, helpers] = useField(name);
  const { value } = meta;
  const { onBlur } = field;
  const { setValue } = helpers;
  // Note: you can't wrap headlessui components with <label>, else they will have broken onBlur functionality.
  // https://github.com/tailwindlabs/headlessui/issues/2843
  return (
    <div>
      <label className='text-slate-600'>{label} </label>
      <Listbox
        name={name}
        value={value}
        onChange={(e) => setValue(e)}
        disabled={disabled}
      >
        <div
          className={`relative font-medium ${
            disabled ? "pointer-events-none opacity-75" : ""
          }`}
        >
          <Listbox.Button className='px-3 py-2 focus-theme flex justify-between items-center bg-slate-50 border border-slate-300 w-full hover:bg-slate-100 text-left ui-active:bg-slate-200 rounded'>
            {list.find((i) => value === i._id)?.label || "Select " + label}
            <FontAwesomeIcon
              icon={faChevronDown}
              className='ui-active:rotate-180 text-slate-400'
            />
          </Listbox.Button>
          <Listbox.Options
            onBlur={onBlur}
            className='absolute left-0 mt-1 right-0 shadow-md border border-slate-300 bg-white rounded'
          >
            {list.map((item) => (
              <Listbox.Option
                key={item._id}
                value={item._id}
                className='flex justify-between px-3 py-2 hover:bg-slate-100 ui-selected:bg-slate-100 cursor-pointer items-center'
              >
                {item.label}

                <FontAwesomeIcon
                  icon={faCheck}
                  className={`text-slate-400 ${
                    item._id === value ? "" : "hidden"
                  }`}
                />
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {meta.touched && meta.error ? (
        <p className='text-orange-600 my-1 ml-1 inline-flex gap-1 items-center text-sm'>
          <FontAwesomeIcon icon={faExclamationTriangle} size='sm' />
          {meta.error}
        </p>
      ) : null}
    </div>
  );
};

export default FormikDropdown;
