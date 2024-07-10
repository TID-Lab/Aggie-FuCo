import React, { useState } from "react";
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
import { useQuery, useQueryClient } from "react-query";
import { getSession } from "./api/session";
import { AxiosError } from "axios";
import { Session } from "./objectTypes";
import RelevantReportsIndex from "./pages/report/RelevantReportsIndex";
import { getAllGroups } from "./api/groups";
import { Button, Modal } from "react-bootstrap";
import PrivateWrapper from "./components/PrivateWrapper";
//TODO: BIG TODO is to correctly type all of react-query usage. Its not critical for function, but it is good for clarity in development.
//TODO: Also BIG TODO is to ensure EVERY API call has a way of surfacing an error message. I want readble UI alerts but at least console.errors.
const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const App = () => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  let sessionFetching = true;
  const sessionQuery = useQuery<Session | undefined, AxiosError>(
    "session",
    getSession,
    {
      onError: (err: AxiosError) => {
        if (err.response && err.response.status === 401) {
          sessionFetching = false;
          navigate("/reports");
        }
      },
      onSuccess: (data) => {
        sessionFetching = true;
        setIsLoggedIn(sessionQuery.isSuccess);
        if (location.pathname === "/login") {
          navigate("/reports");
          // For some reason, when there is a navigation here, the session sometimes doesn't tell the navbar it's signed in. Refetching on navigation fixes that.
          sessionQuery.refetch();
        }
        console.log(sessionQuery.data);
      },
      retry: sessionFetching,
    }
  );

  queryClient.prefetchQuery("all-groups", getAllGroups);
  // This is how we "globalize" an alert. This is only for alerts that should remain over multiple views
  const [globalAlert, setGlobalAlert] = useState<AlertContent>({
    heading: "",
    message: "",
    variant: "primary",
  });

  const InitialApp = (
    <>
      <AggieNavbar isAuthenticated={isLoggedIn} session={sessionQuery.data} />
      <AlertService globalAlert={globalAlert} setGlobalAlert={setGlobalAlert} />
      <Routes>
        <Route path='/'>
          <Route path='reset-password' element={<ResetPassword />} />
          <Route path='login' element={<Login />} />
          {/* <Route path='*' element={<Navigate replace to='login' />} /> */}

          <Route element={<PrivateWrapper isAuth={isLoggedIn} />}>
            <Route index element={<Navigate to={"reports"} />} />
            <Route
              path='reports'
              element={<ReportsIndex setGlobalAlert={setGlobalAlert} />}
            />
            <Route path='report/:id' element={<ReportDetails />} />
            <Route
              path='relevant-reports'
              element={<RelevantReportsIndex setGlobalAlert={setGlobalAlert} />}
            />
            <Route path='groups' element={<GroupsIndex />} />
            <Route path='group/:id' element={<GroupDetails />} />
            <Route path='sources' element={<SourcesIndex />} />
            <Route path='source/:id' element={<SourceDetails />} />
            <Route path='users' element={<UsersIndex />} />
            <Route
              path='user/:id'
              element={<UserProfile session={sessionQuery.data} />}
            />
            <Route path='tags' element={<TagsIndex />} />
            <Route path='config' element={<Configuration />} />
            <Route path='credentials' element={<CredentialsIndex />} />
            <Route path='analysis' element={<Analysis />} />
            <Route path='404' element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  );

  const WrongBrowser = (
    <Modal.Dialog color='danger'>
      <Modal.Header>
        <Modal.Title>:(</Modal.Title>
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
