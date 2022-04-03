import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE, LOAD_OWNED_SPACE } from "redux/types";
import { useMoralis, useWeb3Contract, useMoralisQuery } from "react-moralis";
import Moralis from "moralis";
import abi from "./abi.json";
import "./Space.css";
import axios from "axios";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const auctionDatabase = Moralis.Object.extend("auction");

export default function SpaceMint() {
  const dispatch = useDispatch();
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const { isAuthenticated, web3, user } = useMoralis();
  const [vendingPrice, setVendingPrice] = useState(0);
  const [count, setCount] = useState(1);
  const [bidWarning, setBidWarning] = useState("");
  const [bid, setBid] = useState("1");
  const [cleanBid, setCleanBid] = useState("1");

  const [decimal, setDecimal] = useState(0);

  const getPriceContract = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "vendingPrice",
  });

  const price_wei = getPriceContract.data;

  const vendingContract = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "vending",
    msgValue: web3.utils.toWei((vendingPrice * count).toFixed(decimal), "ether"),
  });

  const auctionContract = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    functionName: "genesisAuction",
    msgValue: web3.utils.toWei(cleanBid, "ether"),
    params: {
      geocode: selected_space ? selected_space.geocode : "",
    },
  });

  useEffect(() => {
    getPriceContract.runContractFunction();
  }, [web3]);

  useEffect(() => {
    if (price_wei) {
      setVendingPrice(price_wei / 10 ** 18);
      setDecimal(Math.max(19 - price_wei.toString().length + 1, 0));
    }
  }, [price_wei]);

  const onMint = async () => {
    vendingContract.runContractFunction();
  };

  const image_server_url = "http://phantaspace.com/thumbnails/";

  const prepareThumbnail = async (geocode) => {
    axios.get(image_server_url + geocode + ".jpg");
  };

  useEffect(() => {
    const result = vendingContract.data;
    var allGeocode = [];
    if (result) {
      const spaceMinted = result?.events?.spaceMinted;
      if (typeof spaceMinted === "object") {
        const geocode = spaceMinted.returnValues.geocode;
        allGeocode = [{ geocode: geocode }];
        user.addUniqq("space", geocode);
        prepareThumbnail(geocode);
      } else {
        result?.events?.spaceMinted.map((space) => {
          const geocode = space.returnValues.geocode;
          allGeocode.push({ geocode: geocode });
          user.addUniqq("space", geocode);
          prepareThumbnail(geocode);
        });
      }
      user.save();
    }
    dispatch({ type: LOAD_OWNED_SPACE, payload: allGeocode });
  }, [vendingContract.data]);

  const onPick = () => {
    dispatch({ type: PICK_A_SPACE });
  };

  const onAuction = async () => {
    auctionContract.runContractFunction();
  };

  useEffect(() => {
    const result = auctionContract.data;
    console.log(result);

    if (result) {
      const AuctionStarted = result?.events?.AuctionStarted;
      const geocode = AuctionStarted.returnValues.geocode;
      const auctionEndTime = AuctionStarted.returnValues.auctionEndTime;
      const HighestBidIncreased = result?.events?.HighestBidIncreased;
      const highestBid = HighestBidIncreased.returnValues.highestBid;
      const highestBidder = HighestBidIncreased.returnValues.highestBidder;
      const newAuction = new auctionDatabase();
      newAuction.set("geocode", geocode);
      newAuction.set("auctionEndTime", auctionEndTime);
      newAuction.set("highestBid", highestBid);
      newAuction.set("highestBidder", highestBidder);
      newAuction.save();
      user.add("auction", { geocode: geocode, bid: highestBid });
      user.save();
    }
  }, [auctionContract.data]);

  useEffect(() => {
    if (isNumeric(bid)) {
      if (bid >= vendingPrice * 25) {
        setBidWarning(" ");
        setCleanBid(bid.toString());
      } else {
        setBidWarning("Must be ≥ " + vendingPrice * 25);
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
        <div className="card-body text-center text-light qty">
          <div className="row justify-content-center">
            <button
              type="button"
              className="btn btn-light rounded"
              // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
              onClick={() => onPick()}
            >
              {selected_space ? "Pick a different Space" : "Pick a unclaimed Space"}
            </button>
          </div>

          {selected_space ? (
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
                  Bid for this Space
                </button>
              </div>
              <div className="row justify-content-center mt-3">
                <h6>
                  This is an on-chain auction with starting price of {vendingPrice * 25} ETH. Your first bid will
                  initiate a 48-hour auction. Any bid in the last 10 minutes will extend the auction by 10 minutes. To
                  prevent re-entrancy attach, you can only withdraw your bid after the auction.
                </h6>
              </div>
            </div>
          ) : null}

          <p className="or-bar">
            <span>Or</span>
          </p>

          <div className="row justify-content-center count bg-dark">
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
              Mint
            </button>
          </div>
          <div className="row justify-content-center mt-3">
            <h6>
              Since there are only 4% of the earth's surface has human activity, the vending price is set to be 4% of
              the auction starting price ({vendingPrice * 25} ETH). Good luck!
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
