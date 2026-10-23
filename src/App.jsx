import { useEffect, Fragment, useState } from "react";
import { useMoralis } from "react-moralis";
import { supabase, useAuth } from "./supabase";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ProgressBar } from "react-bootstrap";

import Header from "./components/Header";

import { useDispatch, useSelector } from "react-redux";

import ExploreList from "./components/explore/ExploreList";
import CreateList from "./components/create/CreateList";
import Map from "./components/Map";
import {
  LOAD_ALL,
  LOADING_ALL,
  UPDATE,
  CLEAN_OWNED,
  CLEAN_OWNED_SPACE,
  SET_ACCOUNT,
  LOAD_ALL_BOXES,
} from "redux/types";
import Space from "components/space/Space";
import getAssetsByOpensea from "components/getAssets/byOpensea";
import getAssetsByOpenseaMatic from "components/getAssets/byOpenseaMatic";
import JumpIn from "components/jumpIn/JumpIn";
import Place from "components/place/Place";
import Phanton from "components/phanton/Phanton";
import web3Utils from "web3-utils";

var viewerWidth = "calc(100% - var(--listWidth))";
const height = "calc(100vh - var(--navBarHeight))";
const mobileWidth = 600;

export default function App() {
  // detect if mobile
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const { isWeb3Enabled, enableWeb3, isWeb3EnableLoading } = useMoralis();
  const { isAuthenticated, account } = useAuth();
  const dispatch = useDispatch();
  const allNFTs = useSelector((state) => state.map.all);
  const ownedNFTs = useSelector((state) => state.map.owned);
  const loadingOwn = useSelector((state) => state.sidebar.loading);
  const loading_all = useSelector((state) => state.sidebar.loading_all);
  const connectorIdInStore = useSelector((state) => state.account.connectorId);

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorIdInStore });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  // get all NFTs
  useEffect(() => {
    supabase
      .from("allNFT")
      .select()
      .then(({ data }) => {
        dispatch({ type: LOAD_ALL, payload: data || [] });
        dispatch({ type: LOADING_ALL, payload: false });
      });
  }, []);

  useEffect(async () => {
    if (account) {
      dispatch({ type: SET_ACCOUNT, payload: account });

      const chainId = 1; // Ethereum Mainnet
      // const chainId = 4; // Rinkeby

      if (parseInt(window.ethereum.networkVersion) !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3Utils.toHex(chainId) }],
          });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          // if (err.code === 4902) {
          //   await window.ethereum.request({
          //     method: "wallet_addEthereumChain",
          //     params: [
          //       {
          //         chainName: "Polygon Mainnet",
          //         chainId: web3Utils.toHex(chainId),
          //         nativeCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
          //         rpcUrls: ["https://polygon-rpc.com/"],
          //       },
          //     ],
          //   });
          // }
        }
      }

      getAssetsByOpensea(account, dispatch);
      getAssetsByOpenseaMatic(account, dispatch);
    } else {
      dispatch({ type: CLEAN_OWNED });
      dispatch({ type: CLEAN_OWNED_SPACE });
    }
  }, [account]);

  // mark existing NFTs as placed
  // save user NFT list on server and add a refresh button to remove this step
  useEffect(() => {
    if (ownedNFTs.length > 0) {
      ownedNFTs.map((owned) => {
        const existingNFT = allNFTs.find((eixisting) => {
          if (eixisting.NFTid === owned.NFTid) {
            return eixisting;
          }
        });
        if (existingNFT) {
          dispatch({ type: UPDATE, payload: existingNFT });
        }
      });
    }
  }, [loadingOwn, loading_all]);

  useEffect(() => {
    supabase
      .from("box")
      .select()
      .limit(10000)
      .then(({ data }) => dispatch({ type: LOAD_ALL_BOXES, payload: data || [] }));
  }, []);

  const map_loaded = useSelector((state) => state.map.map_loading);
  // const map_loaded = null;
  const [progress, setProgress] = useState(0);
  const timerId = setTimeout(() => {
    setProgress((prev) => {
      return Math.min(prev + 1, 850);
    });
  }, 1);
  // not sure why it works. Looks like react rerenders many times and triggers setTimeout
  useEffect(() => {
    if (map_loaded) {
      clearTimeout(timerId);
    }
  }, [map_loaded]);

  return (
    <Fragment>
      {width > mobileWidth ? <Header headerHeight={"var(--navBarHeight)"} /> : null}
      <div className="container-fluid">
        {map_loaded && (
          <div>
            <div
              id="loading"
              style={{
                position: "fixed",
                display: "block",
                width: "100%",
                height: "100%",
                top: "0",
                left: "0",
                text_align: "center",
                opacity: "0.618",
                backgroundColor: "#000000",
                zIndex: "198",
              }}
              className="d-flex flex-column justify-content-center align-items-center"
            ></div>
            <div
              id="loading"
              style={{
                position: "fixed",
                display: "block",
                width: "100%",
                height: "100%",
                top: "0",
                left: "0",
                text_align: "center",
                opacity: "1",
                zIndex: "199",
              }}
              className="d-flex flex-column justify-content-center align-items-center"
            >
              <img
                id="loading-image p-2"
                className="row rounded-circle"
                style={{
                  zIndex: "200",
                  width: "200px",
                  height: "200px",
                  opacity: "1",
                }}
                src="favicon.png"
                alt="Loading..."
              />

              <div
                className="p-2 mt-4"
                style={{
                  zIndex: "200",
                  width: "200px",
                }}
              >
                <ProgressBar
                  variant="light"
                  style={{
                    backgroundColor: "gray",
                  }}
                  className="rounded"
                  now={progress / 10}
                />
              </div>
            </div>
          </div>
        )}
        <div className="row bg-dark">
          <div
            style={{
              width: "var(--listWidth)",
              maxHeight: height,
              display: width > mobileWidth ? "" : "none",
            }}
            className="overflow-auto"
          >
            <Routes>
              <Route exact path="" element={<ExploreList />} />
              <Route exact path="explore" element={<ExploreList />} />
              <Route exact path="explore/:NFTid" element={<ExploreList />} />
              <Route exact path="create" element={<CreateList />} />
              <Route exact path="space" element={<Space />} />
              <Route exact path="space/:geocode" element={<Space />} />
              <Route exact path="jumpin" element={<JumpIn />} />
              <Route exact path="place" element={<Place />} />
              <Route exact path="p" element={<Phanton />} />
            </Routes>
          </div>

          <Map
            viewerWidth={width > mobileWidth ? viewerWidth : "100vw"}
            viewerHeight={width > mobileWidth ? height : "100vh"}
          />
        </div>
      </div>
    </Fragment>
  );
}
