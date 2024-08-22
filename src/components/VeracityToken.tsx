import { type IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faCheck, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type VeracityOptions } from "../api/enums";

type VeracityKeyMap<T> = {
  [key in VeracityOptions]: T;
};

const VeracityColor: VeracityKeyMap<string> = {
  Unconfirmed: "text-gray-500 bg-slate-200",
  "Confirmed True": "bg-lime-200 text-lime-700 ",
  "Confirmed False": "bg-red-200 text-red-700 ",
};

const VeracityText: VeracityKeyMap<string> = {
  Unconfirmed: "Unconfirmed",
  "Confirmed True": "True",
  "Confirmed False": "False",
};

const VeracityIcon: VeracityKeyMap<IconDefinition> = {
  Unconfirmed: faMinus,
  "Confirmed True": faCheck,
  "Confirmed False": faXmark,
};

interface IProps {
  value?: VeracityOptions;
}
const VeracityToken = ({ value }: IProps) => {
  if (!value) return <></>;
  return (
    <span
      className={`font-medium px-1 flex gap-1 items-center ${VeracityColor[value]}`}
    >
      <FontAwesomeIcon icon={VeracityIcon[value]} />
      {VeracityText[value]}
    </span>
  );
};

export default VeracityToken;
