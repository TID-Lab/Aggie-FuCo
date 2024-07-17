import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@yaireo/tagify/dist/tagify.css";
import AggieNavbar from "./components/AggieNavbar";
import AlertService, { AlertContent } from "./components/AlertService";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ReportsIndex from "./pages/report/ReportsIndex";
import ReportDetails from "./pages/report/ReportDetails";
import GroupsIndex from "./pages/group/GroupsIndex";
import GroupDetails from "./pages/group/GroupDetails";
import SourcesIndex from "./pages/source/SourcesIndex";
import SourceDetails from "./pages/source/SourceDetails";
import UsersIndex from "./pages/user/UsersIndex";
import UserProfile from "./pages/user/UserProfile";
import TagsIndex from "./pages/tag/TagsIndex";
import Configuration from "./pages/Configuration";
import CredentialsIndex from "./pages/CredentialsIndex";
import Login from "./pages/Login";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "./api/session";
import { Axios, AxiosError } from "axios";
import { Session } from "./objectTypes";
import RelevantReportsIndex from "./pages/report/RelevantReportsIndex";
import { getAllGroups } from "./api/groups";
import { Button, Modal } from "react-bootstrap";
//TODO: BIG TODO is to correctly type all of react-query usage. Its not critical for function, but it is good for clarity in development.
//TODO: Also BIG TODO is to ensure EVERY API call has a way of surfacing an error message. I want readble UI alerts but at least console.errors.
const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/login' element={<Login />} />
      <Route path='/*' element={<Navigate replace to='login' />} />
    </Routes>
  );
};

interface IPrivateRouteProps {
  sessionData: Session | undefined;
  setGlobalAlert: React.Dispatch<AlertContent>;
}

const PrivateRoutes = ({ sessionData, setGlobalAlert }: IPrivateRouteProps) => {
  return (
    <Routes>
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/login' element={<Navigate to='/reports' />} />
      {/* <Route path='*' element={<Navigate replace to='login' />} /> */}

      <Route index element={<Navigate to={"/reports"} />} />
      <Route
        path='/reports'
        element={<ReportsIndex setGlobalAlert={setGlobalAlert} />}
      />
      <Route path='/report/:id' element={<ReportDetails />} />
      <Route
        path='/relevant-reports'
        element={<RelevantReportsIndex setGlobalAlert={setGlobalAlert} />}
      />
      <Route path='/groups' element={<GroupsIndex />} />
      <Route path='/group/:id' element={<GroupDetails />} />
      <Route path='/sources' element={<SourcesIndex />} />
      <Route path='/source/:id' element={<SourceDetails />} />
      <Route path='/users' element={<UsersIndex />} />
      <Route path='/user/:id' element={<UserProfile session={sessionData} />} />
      <Route path='/tags' element={<TagsIndex />} />
      <Route path='/config' element={<Configuration />} />
      <Route path='/credentials' element={<CredentialsIndex />} />
      <Route path='/analysis' element={<Analysis />} />
      <Route path='/404' element={<NotFound />} />
    </Routes>
  );
};
const App = () => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userData, setUserData] = useState<Session | undefined>(undefined);

  const navigate = useNavigate();
  const location = useLocation();

  // we just wanna check session once, no need for react query.
  useEffect(() => {
    getSession()
      .then((data: Session) => {
        // did log in
        setIsLoggedIn(true);
        if (data) setUserData(data);
        if (location.pathname === "/login") {
          navigate("/reports");
        }
      })
      .catch((err: AxiosError) => {
        // didn't log in
        if (err.response && err.response.status === 401) {
        }
        setIsLoggedIn(false);
      });
  }, []);

  //queryClient.prefetchQuery("all-groups", getAllGroups);
  // This is how we "globalize" an alert. This is only for alerts that should remain over multiple views
  // replace with recoil
  const [globalAlert, setGlobalAlert] = useState<AlertContent>({
    heading: "",
    message: "",
    variant: "primary",
  });
  const InitialApp = (
    <>
      <AggieNavbar isAuthenticated={isLoggedIn} session={userData} />
      <AlertService globalAlert={globalAlert} setGlobalAlert={setGlobalAlert} />
      {isLoggedIn ? (
        <PrivateRoutes sessionData={userData} setGlobalAlert={setGlobalAlert} />
      ) : (
        <PublicRoutes />
      )}
    </>
  );

  const WrongBrowser = (
    <Modal.Dialog color='danger'>
      <Modal.Header>
        <Modal.Title>{":("}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Hi, unfortunately Aggie does not support Safari yet. Please use Google
          Chrome, Firefox or Edge browser to run Aggie.
        </p>
      </Modal.Body>
    </Modal.Dialog>
  );

  const AppToRender = isSafari() ? WrongBrowser : InitialApp;

  return AppToRender;
};

export default App;
