import { useField } from "formik";
import AggieSwitch from "./AggieSwitch";

interface IProps {
  name: string;
  label?: string;
}
const FormikSwitch = ({ name, label }: IProps) => {
  const [field, meta, helpers] = useField(name);
  const { value } = meta;
  const { setValue } = helpers;

  return (
    <label className='flex items-center gap-2 w-full'>
      <AggieSwitch checked={value} onChange={() => setValue(!value)} />
      <span className='text-slate-600'>{label}</span>
    </label>
  );
};
export default FormikSwitch;
