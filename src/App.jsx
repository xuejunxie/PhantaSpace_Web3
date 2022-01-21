import { useEffect, Fragment } from "react";
import { useMoralis } from "react-moralis";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";
import axios from "axios";

import Header from "./layout/Header";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import Alerts from "./layout/Alerts";

import { useDispatch, useSelector } from "react-redux";

import ExploreList from "./dashboard/ExploreList";
import CreateList from "./dashboard/CreateList";
import Map from "./dashboard/Map";
import { LOAD_ALL, LOAD_OWNED, LOADING } from "redux/types";
import Moralis from "moralis";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

const urlRegex = /(\b(https?|ftp|file|ifps):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

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

  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading, user } = useMoralis();
  const dispatch = useDispatch();
  const allNFTs = useSelector((state) => state.map.all);

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    const query = new Moralis.Query(dataClass);
    query.find().then((results) => {
      dispatch({ type: LOAD_ALL, payload: results.map((item) => item.attributes) });
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
      // account = "0xcda72070e455bb31c7690a170224ce43623d0b6f";

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
                  const existingNFT = allNFTs.find((nft) => nft.NFTid === id);
                  gltfNFTs.push({
                    metadata: nft,
                    url: url,
                    thumbnail: thumbnail,
                    NFTid: id,
                    selected: false,
                    editing: false,
                    placed: existingNFT ? true : false,
                    longitude: existingNFT ? existingNFT.longitude : 0,
                    latitude: existingNFT ? existingNFT.latitude : 0,
                    height: existingNFT ? existingNFT.height : 0,
                    scale: existingNFT ? existingNFT.scale : 100,
                    heading: existingNFT ? existingNFT.heading : 0,
                    pitch: existingNFT ? existingNFT.pitch : 0,
                    roll: existingNFT ? existingNFT.roll : 0,
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
