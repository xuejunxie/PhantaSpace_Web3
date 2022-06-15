import axios from "axios";
import { LOAD_OWNED, LOADING } from "../../redux/types";

var offset = 0;
const limit = 500;
var reachEnd = false;

const baseURL = "https://deep-index.moralis.io/api/v2/";

const header = {
  headers: {
    accept: "application/json",
    "X-API-Key": process.env.REACT_APP_MORALIS_X_API_KEY,
  },
};
const ipfs_url = "https://ipfs.io/ipfs/";
const urlRegex = /(\b(https?|ftp|file|ifps):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

export default async function getAssetsByMoralis(account, dispatch) {
  dispatch({ type: LOADING, payload: true });

  const fetchData = async () => {
    var getURL = baseURL + account + "/nft?chain=eth&format=decimal" + "&offset=" + offset + "&limit=" + limit;

    offset = offset + limit;

    dispatch({ type: LOADING, payload: offset });

    var ownedNFTs = [];
    axios
      .get(getURL, header)
      .then((res) => {
        ownedNFTs = res.data.result;
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

            var metadata = JSON.parse(nft.metadata);
            if (metadata) {
              // find the glb gltf URL in description of the NFT
              if (metadata.description) {
                var urls = metadata.description.match(urlRegex);
                if (urls) {
                  urls.map((resUrl) => {
                    if (resUrl.includes(".glb") || resUrl.includes(".gltf")) {
                      url = resUrl;
                    }
                  });
                }
              }

              // find the glb gltf URL in animation_url of the NFT
              if (metadata.animation_url) {
                if (metadata.animation_url.includes(".glb") || metadata.animation_url.includes(".gltf")) {
                  url = metadata.animation_url;
                  if (metadata.image) {
                    thumbnail = metadata.image;
                  }
                }
              }

              // find the glb gltf URL in image of the NFT
              if (metadata.image) {
                if (metadata.image.includes(".glb") || metadata.image.includes(".gltf")) {
                  url = metadata.image;
                }
              }

              // if (nft.asset_contract.image_url) {
              //   thumbnail = nft.asset_contract.image_url;
              // }

              // if (nft.image_thumbnail_url) {
              //   thumbnail = nft.image_thumbnail_url;
              // }
              // if (nft.image_url) {
              //   thumbnail = nft.image_url;
              // }
            }
            if (url) {
              if (url.includes("ipfs")) {
                url = url.replace("ipfs://", ipfs_url);
              }

              const id = nft.token_address + "-" + nft.token_id;

              gltfNFTs.push({
                metadata: metadata,
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
