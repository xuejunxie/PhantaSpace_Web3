import axios from "axios";
import { LOAD_OWNED, LOADING } from "redux/types";

const baseURL = "https://api.opensea.io/api/v2/assets/matic?owner_address=";

const header = {
  headers: {
    accept: "application/json",
    "X-API-KEY": process.env.REACT_APP_OPENSEA_X_API_KEY,
  },
};
const urlRegex = /(\b(https?|ftp|file|ifps):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

var reachEnd = false;
var offset = 0;
const limit = 50;

export default async function getAssetsByOpenseaMatic(account, dispatch) {
  dispatch({ type: LOADING, payload: true });

  const fetchData = async () => {
    var getURL = baseURL + account + "&limit=" + limit + "&offset=" + offset;
    offset = offset + limit;
    dispatch({ type: LOADING, payload: offset });
    var ownedNFTs = [];
    axios
      .get(getURL, header)
      .then((res) => {
        ownedNFTs = res.data.results;
        if (ownedNFTs.length === 0 || ownedNFTs.length < limit) {
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

            if (1) {
              const id = nft.token_id + "-" + nft.asset_contract.address;
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
                created: new Date().toISOString(),
                updated: null,
                removed: null,
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
