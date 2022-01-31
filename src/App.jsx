import { useEffect, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";
import axios from "axios";

import Header from "./components/Header";

import { useDispatch, useSelector } from "react-redux";

import ExploreList from "./components/ExploreList";
import CreateList from "./components/CreateList";
import Map from "./components/Map";
import { LOAD_ALL, LOADING_ALL, LOAD_OWNED, LOADING, UPDATE } from "redux/types";
import Moralis from "moralis";
import Land from "components/Land";
import Contract from "web3Parts/Contract/Contract";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

const urlRegex = /(\b(https?|ftp|file|ifps):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

var listWidth = "250px";
const headerHeight = "50px";
var viewerWidth = "calc(100% - " + listWidth + ")";
const height = "calc(100vh - " + headerHeight + ")";

export default function App() {
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

  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading, user } = useMoralis();
  const dispatch = useDispatch();
  const allNFTs = useSelector((state) => state.map.all);
  const ownedNFTs = useSelector((state) => state.map.owned);
  const loadingOwn = useSelector((state) => state.sidebar.loading);
  const loadingAll = useSelector((state) => state.sidebar.loadingAll);

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
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

  // load user owned NFTs
  var offset = 0;
  const limit = 20;

  var account = "";
  const baseURL = "https://api.opensea.io/api/v1/assets?owner=";

  useEffect(() => {
    if (user) {
      account = user.attributes.accounts[0];
      // account = "0xe9956cf72cc8e49d903478142dc8dadb4ee328ff";

      var reachEnd = false;
      dispatch({ type: LOADING, payload: true });

      const fetchData = async () => {
        var getURL = baseURL + account + "&limit=" + limit + "&offset=" + offset;
        offset = offset + limit;
        dispatch({ type: LOADING, payload: offset });
        var ownedNFTs = [];
        axios
          .get(getURL)
          .then((res) => {
            ownedNFTs = res.data.assets;
            if (ownedNFTs.length === 0) {
              reachEnd = true;
              dispatch({ type: LOADING, payload: false });
            }
          })
          .catch((err) => {
            console.log(err);
            reachEnd = true;
            dispatch({ type: LOADING, payload: "error" });
          })
          .then((res) => {
            var gltfNFTs = [];

            if (ownedNFTs.length > 0) {
              ownedNFTs.map((nft) => {
                var url = null;
                var thumbnail = null;
                // find the glb gltf URL in description of the NFT
                if (nft.description) {
                  var urls = nft.description.match(urlRegex);
                  if (urls) {
                    urls.map((resUrl) => {
                      if (resUrl.includes(".glb") || resUrl.includes(".gltf")) {
                        url = resUrl;
                      }
                    });
                  }
                }

                // find the glb gltf URL in animation_url of the NFT
                if (nft.animation_url) {
                  if (nft.animation_url.includes(".glb") || nft.animation_url.includes(".gltf")) {
                    url = nft.animation_url;
                  }
                }

                if (nft.asset_contract.image_url) {
                  thumbnail = nft.asset_contract.image_url;
                }

                if (nft.image_thumbnail_url) {
                  thumbnail = nft.image_thumbnail_url;
                }
                if (nft.image_url) {
                  thumbnail = nft.image_url;
                }

                if (url) {
                  const id = nft.asset_contract.address + "-" + nft.token_id;
                  gltfNFTs.push({
                    metadata: nft,
                    url: url,
                    thumbnail: thumbnail,
                    NFTid: id,
                    selected: false,
                    editing: false,
                    placed: false,
                    longitude: 0,
                    latitude: 0,
                    height: 0,
                    scale: 100,
                    heading: 0,
                    pitch: 0,
                    roll: 0,
                  });
                }
              });
            }
            dispatch({ type: LOAD_OWNED, payload: gltfNFTs });

            if (!reachEnd) {
              return fetchData();
            }
          });
        // wash NFTs and add to redux
      };
      fetchData();
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
      <Router>
        <Header headerHeight={headerHeight} />
        <div className="container-fluid">
          <Routes>
            <Route path="/*" element={<Dashboard />} />
            <Route path="/contract" element={<Contract />} />
          </Routes>
        </div>
      </Router>
    </Fragment>
  );
}

function Dashboard() {
  return (
    <div className="row bg-dark">
      <div style={{ width: listWidth, maxHeight: height }} className="overflow-auto">
        <Routes>
          <Route exact path="" element={<ExploreList />} />
          <Route exact path="create" element={<CreateList />} />
          <Route exact path="land/:longitude/:latitude" element={<Land />} />
        </Routes>
      </div>
      <Map viewerWidth={viewerWidth} viewerHeight={height} />
    </div>
  );
}
