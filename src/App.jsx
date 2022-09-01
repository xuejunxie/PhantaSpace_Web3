import { useEffect, Fragment, useState } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ProgressBar } from "react-bootstrap";

import Header from "./components/Header";

import { useDispatch, useSelector } from "react-redux";

import ExploreList from "./components/explore/ExploreList";
import CreateList from "./components/create/CreateList";
import Map from "./components/Map";
import { LOAD_ALL, LOADING_ALL, UPDATE, CLEAN_OWNED, CLEAN_OWNED_SPACE, SET_ACCOUNT } from "redux/types";
import Moralis from "moralis";
import Space from "components/space/Space";
import Contract from "web3Parts/Contract/Contract";
import getAssetsByOpensea from "components/getAssets/byOpensea";
import getAssetsByMoralis from "components/getAssets/byMoralis";
import getAssetsByOpenseaMatic from "components/getAssets/byOpenseaMatic";
import getSpaceByOpensea from "components/getAssets/getSpaceByOpensea";
import JumpIn from "components/jumpIn/JumpIn";
import Phanton from "components/phanton/Phanton";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

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

  const { isWeb3Enabled, web3, enableWeb3, isAuthenticated, isWeb3EnableLoading, user } = useMoralis();
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
    const query = new Moralis.Query(dataClass);
    query.find().then((results) => {
      dispatch({ type: LOAD_ALL, payload: results.map((item) => item.attributes) });
      dispatch({ type: LOADING_ALL, payload: false });
    });
  }, []);

  var account = "";

  useEffect(async () => {
    if (user) {
      account = user.attributes.accounts[0];
      dispatch({ type: SET_ACCOUNT, payload: account });
      // account = "0x9931fCA711C65b94B07D921159Fffa3798F4BeF9";
      // account = user.get("ethAddress");
      // account = "0x4A5577675951Cd448f5537F7Ed2828d6B09d66B0";
      // account = "0xD7B60740E6663c6595e77dD686b07E0870Cb6bc7";
      // big account
      // account = "0x7cEd6E99BD19e923b2B756A1aBf6eA2D27dCf748";
      // account = "0x8f00dD4Fa196D287f9E862dbB39d66D8C7Ef7364";
      // account = "0xcda72070e455bb31c7690a170224ce43623d0b6f";
      // account = "0x8b87e652922445bcac00887e637a07a31af47b02";
      // account = "0xce90a7949bb78892f159f428d0dc23a8e3584d75";
      // account = "0x5a501b42cfab342571f8ddf18e5e952a8a9bf60f";
      // get user owned NFTs

      const chainId = 1; // Ethereum Mainnet
      // const chainId = 4; // Rinkeby

      if (parseInt(window.ethereum.networkVersion) !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainId) }],
          });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          // if (err.code === 4902) {
          //   await window.ethereum.request({
          //     method: "wallet_addEthereumChain",
          //     params: [
          //       {
          //         chainName: "Polygon Mainnet",
          //         chainId: web3.utils.toHex(chainId),
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
      // getSpaceByOpensea(account, dispatch);
      // getAssetsByMoralis(account, dispatch);
    } else {
      dispatch({ type: CLEAN_OWNED });
      dispatch({ type: CLEAN_OWNED_SPACE });
    }
  }, [user]);

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

  const map_loaded = useSelector((state) => state.map.map_loading);
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
              <Route exact path="phanton" element={<Phanton />} />
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
