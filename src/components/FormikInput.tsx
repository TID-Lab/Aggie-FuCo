import {
  faExclamationTriangle,
  faInfoCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, useField } from "formik";

interface IProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
}
const FormikInput = ({ name, label, type, placeholder }: IProps) => {
  const [field, meta, helpers] = useField(name);
  const { value } = meta;
  const { setValue } = helpers;
  return (
    <label className='flex flex-col gap-1 text-slate-600'>
      {label ? label : name}

      <input
        name={name}
        placeholder={placeholder ? placeholder : "Enter " + label}
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className='px-3 py-2 focus-theme rounded border border-slate-300 bg-slate-50'
      />
      {meta.touched && meta.error ? (
        <p className='text-orange-600 my-1 ml-1 inline-flex gap-1 items-center text-sm'>
          <FontAwesomeIcon icon={faExclamationTriangle} size='sm' />
          {meta.error}
        </p>
      ) : null}
    </label>
  );
};
export default FormikInput;
