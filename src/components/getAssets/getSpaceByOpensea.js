import axios from "axios";
import { LOAD_OWNED_SPACE, LOADING_SPACE } from "../../redux/types";

const baseURL = process.env.REACT_APP_OPENSEA_API_URL + "/v1/assets?owner=";

const header = {
  headers: {
    accept: "application/json",
    "X-API-KEY": process.env.REACT_APP_OPENSEA_X_API_KEY,
  },
};

export default async function getSpaceByOpensea(account, dispatch) {
  var offset = 0;
  const limit = 50;
  var reachEnd = false;
  dispatch({ type: LOADING_SPACE, payload: true });
  const fetchData = async () => {
    var getURL =
      baseURL +
      account +
      "&asset_contract_address=" +
      process.env.REACT_APP_CONTRACT_ADDRESS +
      "&limit=" +
      limit +
      "&offset=" +
      offset;
    offset = offset + limit;
    dispatch({ type: LOADING_SPACE, payload: offset });

    var ownedSpaces = [];
    axios
      .get(getURL)
      .then((res) => {
        ownedSpaces = res.data.assets;
        if (ownedSpaces.length === 0 || ownedSpaces.length < limit) {
          reachEnd = true;
          dispatch({ type: LOADING_SPACE, payload: false });
        }

        dispatch({ type: LOAD_OWNED_SPACE, payload: ownedSpaces });

        if (!reachEnd) {
          return fetchData();
        }
      })
      .catch((err) => {
        console.log(err);
        reachEnd = true;
        dispatch({ type: LOADING_SPACE, payload: "error" });
      });
    // wash NFTs and add to redux
  };
  fetchData();
}
