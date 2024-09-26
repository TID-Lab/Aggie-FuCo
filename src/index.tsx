import React from "react";
import ReactDOM from "react-dom";
import { AxiosError } from "axios";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

// import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// default queryClient stuff. will need to refactor as this is deprecated in v5
//https://dev-listener.medium.com/react-routes-nodejs-routes-2875f148065b
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (err) => {
        const error = err as AxiosError;
        if (error.response && error.response.status === 401) {
          window.location.reload();
        }
      },
    },
  },
});
ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
// React Query in 100 seconds https://www.youtube.com/watch?v=novnyCaa7To
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
