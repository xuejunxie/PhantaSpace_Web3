import { useEffect, Fragment, useState } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Button, Card, Modal } from "react-bootstrap";

import Header from "./components/Header";

import { useDispatch, useSelector } from "react-redux";

import ExploreList from "./components/ExploreList";
import CreateList from "./components/CreateList";
import Map from "./components/Map";
import { LOAD_ALL, LOADING_ALL, UPDATE, CLEAN_OWNED, CLEAN_OWNED_SPACE } from "redux/types";
import Moralis from "moralis";
import Space from "components/Space";
import Contract from "web3Parts/Contract/Contract";
import getAssetsByOpensea from "components/getAssetsByOpensea";
import getAssetsByMoralis from "components/getAssetsByMoralis";
import getAssetsByOpenseaMatic from "components/getAssetsByOpenseaMatic";
import getSpaceByOpensea from "components/getSpaceByOpensea";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

var viewerWidth = "calc(100% - var(--listWidth))";
const height = "calc(100vh - var(--navBarHeight))";
const mobileWidth = 768;

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
  const loadingAll = useSelector((state) => state.sidebar.loadingAll);
  const connectorIdInStore = useSelector((state) => state.account.connectorId);
  const [isNetWarningVisible, setIsNetWarningVisible] = useState(false);

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

  useEffect(() => {
    if (user) {
      account = user.attributes.accounts[0];
      // account = user.get("ethAddress");
      // account = "0x8b87E652922445BCaC00887e637A07A31af47B02";
      // account = "0x4A5577675951Cd448f5537F7Ed2828d6B09d66B0";
      // account = "0xe9956cf72cc8e49d903478142dc8dadb4ee328ff";
      // big account
      // account = "0x8f00dD4Fa196D287f9E862dbB39d66D8C7Ef7364";
      // account = "0xcda72070e455bb31c7690a170224ce43623d0b6f";
      // account = "0x8b87e652922445bcac00887e637a07a31af47b02";
      // account = "0xce90a7949bb78892f159f428d0dc23a8e3584d75";
      // account = "0x5a501b42cfab342571f8ddf18e5e952a8a9bf60f";
      // get user owned NFTs

      if (web3.eth.currentProvider) {
        web3.eth.net.getId().then((networkId) => {
          if (networkId != 1) {
            setIsNetWarningVisible(true);
          }
        });
      }

      getAssetsByOpensea(account, dispatch);
      // getAssetsByOpenseaMatic(account, dispatch);
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
  }, [loadingOwn, loadingAll]);

  return (
    <Fragment>
      {width > mobileWidth ? <Header headerHeight={"var(--navBarHeight)"} /> : null}
      <div className="container-fluid">
        <div className="row bg-dark">
          {width > mobileWidth ? (
            <div style={{ width: "var(--listWidth)", maxHeight: height }} className="overflow-auto">
              <Routes>
                <Route exact path="" element={<ExploreList />} />
                <Route exact path="explore" element={<ExploreList />} />
                <Route exact path="explore/:NFTid" element={<ExploreList />} />
                <Route exact path="create" element={<CreateList />} />
                <Route exact path="space" element={<Space />} />
                <Route exact path="space/:geocode" element={<Space />} />
              </Routes>
            </div>
          ) : null}
          <Map
            viewerWidth={width > mobileWidth ? viewerWidth : "100vw"}
            viewerHeight={width > mobileWidth ? height : "100vh"}
          />
        </div>
      </div>

      <Modal show={isNetWarningVisible} onHide={() => setIsNetWarningVisible(false)}>
        <Modal.Header>
          <Modal.Title>Please switch to Ethereum Mainnet</Modal.Title>
        </Modal.Header>
      </Modal>
    </Fragment>
  );
}
