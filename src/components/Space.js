import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Moralis from "moralis";
import abi from "./abi.json";
import "./Space.css";
import SpaceOwned from "./SpaceOwned";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const [key, setKey] = useState("mint");
  const { isAuthenticated, web3 } = useMoralis();
  const [price, setPrice] = useState(0);
  const [count, setCount] = useState(1);
  const [bidWarning, setBidWarning] = useState("");
  const [bid, setBid] = useState(1);
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
    msgValue: web3.utils.toWei((price * count).toFixed(decimal), "ether"),
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
    dispatch({ type: SPACE });
    dispatch({ type: SELECT_SPACE, payload: null });
  }, []);

  useEffect(() => {
    getPriceContract.runContractFunction();
  }, [web3]);

  useEffect(() => {
    if (price_wei) {
      setPrice(price_wei / 10 ** 18);
      setDecimal(Math.max(19 - price_wei.toString().length, 0));
    }
  }, [price_wei]);

  useEffect(() => {
    if (spacePosition.geocode) {
      const space = {
        geocode: spacePosition.geocode,
      };
      dispatch({ type: SHOW_SPACE, payload: space });
      dispatch({ type: SELECT_SPACE, payload: space });
    }
  }, [spacePosition]);

  useEffect(() => {
    if (selected_space) {
      window.history.pushState("", "", `#/space/${selected_space.geocode}`);
    }
  }, [selected_space]);

  useEffect(() => {
    if (key === "mint") {
    }
    if (key === "owned") {
      console.log("show owned");
    }
  }, [key]);

  const onMint = async () => {
    vendingContract.runContractFunction();
  };

  useEffect(() => {
    console.log(vendingContract.data);
    // const result = vendingContract.data;
    // if (result) {
    //   result.events.spaceMinted.map((space) => {
    //     console.log(space);
    //   });
    // }
  }, [vendingContract.data]);

  const onPick = () => {
    dispatch({ type: PICK_A_SPACE });
  };

  const onAuction = async () => {
    // auctionContract.runContractFunction();
    console.log(bid);
  };

  useEffect(() => {
    if (isNumeric(bid)) {
      setBidWarning(" ");
      setCleanBid(bid.toString());
    } else {
      if (bid) {
        setBidWarning("Bid must be a number");
      }
    }
  }, [bid]);

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  return (
    <div className="bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="mint" title="Mint" tabClassName="text-light ml-1">
          <div className="card-body text-center text-light mt-3 qty">
            <div className="row justify-content-center mt-3">
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
              </div>
            ) : null}

            <p className="or-bar">
              <span>Or</span>
            </p>

            <div className="row justify-content-center count bg-dark">Mint random spaces</div>

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
              = {(count * price).toFixed(decimal)} ETH
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
          </div>
        </Tab>

        {isAuthenticated ? (
          <Tab eventKey="owned" title="Owned" tabClassName="text-light">
            <SpaceOwned />
          </Tab>
        ) : null}
        <Tab eventKey="auction" title="Auction" tabClassName="text-light"></Tab>
      </Tabs>
    </div>
  );
}
