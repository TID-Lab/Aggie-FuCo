// re-routes unauthed users to login

import { Navigate, Outlet } from "react-router-dom";

interface IProps {
  isAuth: boolean;
}

const PrivateWrapper = ({ isAuth }: IProps) => {
  return isAuth ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateWrapper;
