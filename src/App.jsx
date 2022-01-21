import { useEffect, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";

import Header from "./layout/Header";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import Alerts from "./layout/Alerts";

import { useDispatch } from "react-redux";

import ExploreList from "./dashboard/ExploreList";
import CreateList from "./dashboard/CreateList";
import Map from "./dashboard/Map";
import { LOAD_ALL } from "redux/types";
import Moralis from "moralis";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

const alertOptions = {
  timeout: 3000,
  position: "top center",
};

var listWidth = "250px";
const headerHeight = "50px";
var viewerWidth = "calc(100vw - " + listWidth + ")";
const height = "calc(100vh - " + headerHeight + ")";

const App = () => {
  // // detect if mobile
  // const [width, setWidth] = useState(window.innerWidth);

  // function handleWindowSizeChange() {
  //   setWidth(window.innerWidth);
  //   const isMobile = width <= 768;
  //   console.log(window.innerWidth);
  //   if (isMobile) {
  //     listWidth = "20vw";
  //     viwerWidth = "calc(100vw - " + listWidth + ")";
  //     console.log("mobile");
  //   }
  // }
  // useEffect(() => {
  //   window.addEventListener("resize", handleWindowSizeChange);
  //   return () => {
  //     window.removeEventListener("resize", handleWindowSizeChange);
  //   };
  // }, []);

  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const dispatch = useDispatch();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    const query = new Moralis.Query(dataClass);
    query.find().then((results) => {
      const allNFT = results.map((item) => item.attributes);
      dispatch({ type: LOAD_ALL, payload: allNFT });
    });
  }, []);

  return (
    <Fragment>
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
      <Map viewerWidth={viewerWidth} viewerHeight={height} />
    </div>
  );
}

export default App;
