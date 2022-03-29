import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "./abi.json";
import "./Space.css";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.space.selected_space);
  const space_picked = useSelector((state) => state.sidebar.space_picked);
  const pick_a_space = useSelector((state) => state.sidebar.pick_a_space);
  const [key, setKey] = useState("mint");
  const { isAuthenticated, web3 } = useMoralis();
  const [price, setPrice] = useState(0);
  const [count, setCount] = useState(1);

  const [decimal, setDecimal] = useState(0);

  const getPriceContract = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: "0x68fA24fd81e2f4e72437d56B15C46601459Cae0e",
    functionName: "vendingPrice",
  });

  const price_wei = getPriceContract.data;

  const vendingContract = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: "0x68fA24fd81e2f4e72437d56B15C46601459Cae0e",
    functionName: "vending",
    msgValue: web3.utils.toWei((price * count).toFixed(decimal), "ether"),
  });

  useEffect(() => {
    dispatch({ type: SPACE });
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
    const result = vendingContract.data;
    if (result) {
      result.events.spaceMinted.map((space) => {
        console.log(space);
      });
    }
  }, [vendingContract.data]);

  const onPick = () => {
    dispatch({ type: PICK_A_SPACE });
  };

  const onAuction = async () => {};

  return (
    <div className="bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="mint" title="Mint" tabClassName="text-light ml-1">
          <div className="card-body text-center text-light mt-3 qty">
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
            <div type="number" className="row count justify-content-center count bg-dark" name="qty">
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
            <p className="or-bar">
              <span>Or</span>
            </p>

            <div className="row justify-content-center mt-3">
              <button
                type="button"
                className="btn btn-light rounded"
                // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
                onClick={() => onPick()}
              >
                {space_picked ? "Pick a different Space" : "Pick a unclaimed Space"}
              </button>
            </div>

            {space_picked ? (
              <div className="row justify-content-center mt-5">
                <button
                  type="button"
                  className="btn btn-light rounded"
                  // style={{ font: "20px/1 Arial, sans-serif", font_weight: "700" }}
                  onClick={() => onAuction()}
                >
                  Bid for this Space
                </button>
              </div>
            ) : null}
          </div>
        </Tab>

        {isAuthenticated ? <Tab eventKey="owned" title="Owned" tabClassName="text-light"></Tab> : null}
        <Tab eventKey="auction" title="Auction" tabClassName="text-light"></Tab>
      </Tabs>
    </div>
  );
}
