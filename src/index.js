import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.css";
import store from "./redux/store";
import { Provider } from "react-redux";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import SpaceNFT from "components/spaceNFT/SpaceNFT";
import PhantonStandalone from "components/phanton/PhantonStandalone";

/** Get your free Moralis Account https://moralis.io/ */

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

const Application = () => {
  const isServerInfo = APP_ID && SERVER_URL ? true : false;
  //Validate
  if (!APP_ID || !SERVER_URL)
    throw new Error("Missing Moralis Application ID or Server URL. Make sure to set your .env file.");
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
                <App isServerInfo={isServerInfo} />
              </MoralisProvider>
            }
          />
          <Route
            exact
            path="/phanton"
            element={
              <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
                <PhantonStandalone />
              </MoralisProvider>
            }
          />
          <Route exact path="/NFT/space/:geocode" element={<SpaceNFT />} />
        </Routes>
      </Router>
    </Provider>
  );
};

ReactDOM.render(
  // <React.StrictMode>
  <Application />,
  // </React.StrictMode>,
  document.getElementById("root")
);
