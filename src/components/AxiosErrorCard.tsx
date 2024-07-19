import { AxiosError } from "axios";
import ErrorCard from "./ErrorCard";

interface IProps {
  error: unknown;
}

function isAxiosError(e: unknown) {
  if (e instanceof AxiosError && e.response) {
    return { status: e.response.status, data: e.response.data };
  }
  return {
    status: 500,
    data: "Unknown and unexpected error has occurred. please contact the developer because you should not see this message",
  };
}

const AxiosErrorCard = ({ error }: IProps) => {
  const { status, data } = isAxiosError(error);

  return <ErrorCard errorStatus={status} errorData={data} />;
};

export default AxiosErrorCard;
