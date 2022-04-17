import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  SPACE,
  PICK_A_SPACE,
  SELECT_SPACE,
  SHOW_SPACE,
  LOAD_OWNED_SPACE,
  ADD_OWNED_SPACE,
  SET_SPACE_TAB,
  LOAD_USER_BIDS,
} from "redux/types";
import { useMoralis, useWeb3Contract, useMoralisQuery } from "react-moralis";
import Moralis from "moralis";
import abi from "./abi.json";
import "./Space.css";
import axios from "axios";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

const opense_asset_url = "https://opensea.io/assets/";

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const auctionDatabase = Moralis.Object.extend("auction");

export default function SpaceMint() {
  const dispatch = useDispatch();
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const { isAuthenticated, web3, user, refetchUserData } = useMoralis();
  const [vendingPrice, setVendingPrice] = useState(0);
  const [auctionFloor, setAuctionFloor] = useState(0);

  const [count, setCount] = useState(1);
  const [bidWarning, setBidWarning] = useState("");
  const [bid, setBid] = useState("1");
  const [cleanBid, setCleanBid] = useState("1");
  const [loadingMint, setLoadingMint] = useState(false);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const userBids = useSelector((state) => state.space.userBids);
  const [auctionAllowed, setAuctionAllowed] = useState(false);
  const all_space = useSelector((state) => state.space.all);
  const [spaceIsTaken, setSpaceIsTaken] = useState(null);

  var BN = web3.utils.BN;

  const [decimal, setDecimal] = useState(0);

  const getVendingPriceContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "vendingPrice",
  });

  const getAuctionFloorContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "auctionFloor",
  });

  const vendingPrice_wei = getVendingPriceContract.data;
  const auctionFloor_wei = getAuctionFloorContract.data;

  const vendingContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "vending",
    msgValue: web3.utils.toWei((vendingPrice * count).toFixed(decimal), "ether"),
    params: {
      vendingLevel: "03",
    },
  });

  useEffect(() => {
    getVendingPriceContract.runContractFunction();
    getAuctionFloorContract.runContractFunction();
  }, [web3]);

  useEffect(() => {
    if (vendingPrice_wei) {
      setVendingPrice(vendingPrice_wei / 10 ** 18);
      setDecimal(Math.max(19 - vendingPrice_wei.toString().length + 1, 0));
    }

    if (auctionFloor_wei) {
      setAuctionFloor(auctionFloor_wei / 10 ** 18);
    }
  }, [vendingPrice_wei, auctionFloor_wei]);

  const onMint = async () => {
    setLoadingMint(true);
    vendingContract.runContractFunction().then(async (res) => {
      console.log("res", res);
      if (res === undefined) {
        setLoadingMint(false);
        return;
      }
    });
  };

  const image_server_url = "http://phantaspace.com/thumbnails/";

  const prepareThumbnail = async (geocode) => {
    axios.get(image_server_url + geocode + ".jpg");
  };

  useEffect(() => {
    const result = vendingContract.data;
    var allGeocode = [];
    if (result) {
      const spaceMinted = result?.events?.SpaceMinted;
      if (spaceMinted.length === undefined) {
        const geocode = spaceMinted.returnValues.geocode;
        allGeocode = [{ geocode: geocode }];
        user.addUnique("space", geocode);
        prepareThumbnail(geocode);
      } else {
        result?.events?.SpaceMinted.map((space) => {
          const geocode = space.returnValues.geocode;
          allGeocode.push({ geocode: geocode });
          user.addUnique("space", geocode);
          prepareThumbnail(geocode);
        });
      }
      user.save();
      setLoadingMint(false);
      dispatch({ type: SET_SPACE_TAB, payload: "owned" });
      dispatch({ type: ADD_OWNED_SPACE, payload: allGeocode });
    }
  }, [vendingContract.data]);

  const onPick = () => {
    dispatch({ type: PICK_A_SPACE });
  };

  const getPermalink = (geocode) => {
    return opense_asset_url + process.env.REACT_APP_CONTRACT_ADDRESS + "/" + geocode;
  };

  useEffect(() => {
    setSpaceIsTaken(null);
    if (selected_space && all_space) {
      const space_index = all_space.findIndex((space) => space.geocode == selected_space.geocode);
      if (space_index === -1) {
        setAuctionAllowed(true);
      } else {
        setAuctionAllowed(false);
        if (all_space[space_index].auctionEndTime > Date.now() / 1000) {
          dispatch({ type: SET_SPACE_TAB, payload: "auction" });
        } else {
          setSpaceIsTaken(
            <Fragment>
              <h6 className="mt-2"> Space is taken </h6>
              <a
                href={getPermalink(selected_space.geocode)}
                className="text-light  justify-content-center"
                target="_blank"
              >
                <button type="button" className="  btn btn-light rounded ">
                  See it on Opensea
                </button>
              </a>
            </Fragment>
          );
        }
      }
    }
  }, [selected_space, all_space]);

  const auctionContract = useWeb3Contract({
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "genesisAuction",
    msgValue: cleanBid,
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  const onAuction = async () => {
    setLoadingAuction(true);
    auctionContract.runContractFunction().then(async (res) => {
      await refetchUserData();
      const getUserAuction = await user.get("auction");
      if (getUserAuction && getUserAuction.length > 0) {
        dispatch({ type: LOAD_USER_BIDS, payload: getUserAuction });
      }
      dispatch({ type: SET_SPACE_TAB, payload: "auction" });
      setLoadingAuction(false);
    });
  };

  //   useEffect(async () => {
  //     const result = await auctionContract.data;
  //     console.log("auction rsult", result);
  //   }, [auctionContract.data]);

  useEffect(() => {
    if (isNumeric(bid)) {
      if (bid >= auctionFloor) {
        setBidWarning(" ");
        setCleanBid(web3.utils.toWei(bid.toString(), "ether"));
      } else {
        setBidWarning("Must be ≥ " + auctionFloor);
      }
    } else {
      if (bid) {
        setBidWarning("Invalid number");
      }
    }
  }, [bid]);

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n.match(/^[0-9]*\.?[0-9]*$/); // '1e2' like number will not pass this test
  }

  return (
    <Fragment>
      {isAuthenticated ? (
        <div
          className="card-body text-center text-light qty overflow-auto"
          style={{ maxHeight: "calc(100vh - var(--navBarHeight) - var(--navTabHeight))" }}
        >
          <div className="row justify-content-center">
            <button
              type="button"
              className="btn btn-light rounded"
              // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
              onClick={() => onPick()}
            >
              {auctionAllowed ? "Pick a different Space" : "Pick an unclaimed Space"}
            </button>
          </div>
          {spaceIsTaken}
          {auctionAllowed ? (
            <div>
              <div className="row  justify-content-center mt-4 ">
                <input
                  type="number"
                  className="form-control col-6 rounded "
                  id="bid"
                  placeholder="Enter your bid"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                />
                <div type="number" className="count col bg-dark col-3 mt-1">
                  ETH
                </div>
              </div>
              <div className=" row justify-content-start bg-dark mt-1">
                <div className="col-9 justify-content-center">{bidWarning}</div>
              </div>
              <div className="row justify-content-center ">
                <button
                  type="button"
                  className="btn btn-light  rounded mt-4"
                  // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
                  onClick={() => onAuction()}
                >
                  <div className="row">
                    {loadingAuction ? (
                      <Fragment>
                        <div className="spinner-border spinner-border-sm mr-1 ml-2 mt-1" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div className="mr-2">Starting auction</div>
                      </Fragment>
                    ) : (
                      <div className="ml-2 mr-2">Bid for this space</div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ) : null}
          <div className="row justify-content-center mt-3">
            <h6>
              This is an on-chain auction with starting price of {auctionFloor} ETH. Your first bid will initiate a
              48-hour auction. Any bid in the last 10 minutes will extend the auction by 10 minutes. To prevent
              re-entrancy attach, you can only withdraw your bid after the auction.
            </h6>
          </div>

          <p className="or-bar">
            <span>Or</span>
          </p>

          <div className="row justify-content-center h4 bg-dark">
            Mint random spaces with {vendingPrice} ETH per space
          </div>

          <div className="row justify-content-center mt-3 mb-3">
            <span
              className="minus bg-dark"
              onClick={() => {
                count > 1 && setCount(count - 1);
              }}
            >
              -
            </span>
            <div type="number" className="count bg-dark" name="qty">
              {count}
            </div>
            <span
              className="plus bg-dark"
              onClick={() => {
                setCount(count + 1);
              }}
            >
              +
            </span>
          </div>
          <div type="number" className="row count justify-content-center bg-dark" name="qty">
            = {(count * vendingPrice).toFixed(decimal)} ETH
          </div>
          <div className="row justify-content-center mt-3">
            <button
              type="button"
              className="btn btn-light rounded"
              // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
              onClick={() => onMint()}
            >
              {loadingMint ? (
                <div className="row">
                  <div className="spinner-border spinner-border-sm ml-2 mt-1" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <div className="ml-2 mr-2">Minting</div>
                </div>
              ) : (
                <div>Mint</div>
              )}
            </button>
          </div>
          <div className="row justify-content-center mt-3">
            <h6>
              Since there are only 4% of the earth's surface has human activity, the vending price is set to be 4% of
              the auction starting price ({auctionFloor} ETH). Good luck!
            </h6>
          </div>
        </div>
      ) : (
        <div className="card card-body bg-dark text-light">
          <div className="row justify-content-center">
            <h5>Connect your wallet to mint</h5>
          </div>
        </div>
      )}
    </Fragment>
  );
}
