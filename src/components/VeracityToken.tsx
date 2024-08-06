import { VeracityOptions } from "../api/enums";

interface IProps {
  value: VeracityOptions | undefined;
}

const VeracityColor: {
  [key in VeracityOptions]: string;
} = {
  Unconfirmed: "text-gray-700 bg-slate-300",
  "Confirmed True": "bg-lime-200 text-lime-700 ",
  "Confirmed False": "bg-red-200 text-red-700 ",
};

const VeracityToken = ({ value }: IProps) => {
  if (!value) return <></>;
  return (
    <span className={`font-medium px-1 ${VeracityColor[value]}`}>{value}</span>
  );
};

export default VeracityToken;
