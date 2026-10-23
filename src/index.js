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
import { AuthProvider } from "./supabase";

// Moralis is only used client-side for wallet connection and contract calls (no Moralis server).
const Web3 = ({ children }) => (
  <MoralisProvider initializeOnMount={false}>
    <AuthProvider>{children}</AuthProvider>
  </MoralisProvider>
);

const Application = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              <Web3>
                <App />
              </Web3>
            }
          />
          <Route
            exact
            path="/phanton"
            element={
              <Web3>
                <PhantonStandalone />
              </Web3>
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
