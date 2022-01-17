import { useEffect, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./style.css";

import Header from "./layout/Header";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import Alerts from "./layout/Alerts";

import PrivateRoute from "./common/PrivateRoute";

import { Provider } from "react-redux";
import store from "./redux/store";

import ExploreList from "./dashboard/ExploreList";
import CreateList from "./dashboard/CreateList";
import Map from "./dashboard/Map";

const alertOptions = {
  timeout: 3000,
  position: "top center",
};

const listWidth = "250px";
const headerHeight = "50px";
const viwerWidth = "calc(100vw - " + listWidth + ")";
const height = "calc(100vh - " + headerHeight + ")";

const App = () => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Fragment>
      <Provider store={store}>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <Router>
            <Header headerHeight={headerHeight} />
            <Alerts />
            <div className="container-fluid">
              <Routes>
                <Route path="/*" element={<Dashboard />} />
              </Routes>
            </div>
          </Router>
        </AlertProvider>
      </Provider>
    </Fragment>
  );
};

function Dashboard() {
  return (
    <div className="row bg-dark">
      <div style={{ width: listWidth, maxHeight: height }} className="overflow-auto">
        <Routes>
          <Route exact path="" element={<ExploreList />} />
          <Route exact path="create" element={<CreateList />} />
        </Routes>
      </div>
      <Map viwerWidth={viwerWidth} viewHeight={height} />
    </div>
  );
}

export default App;
