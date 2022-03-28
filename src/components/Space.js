import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Moralis from "moralis";
import abi from "./abi.json";
import "./Space.css";
import { OpenSeaPort, Network } from "opensea-js";
import { ConsoleSqlOutlined } from "@ant-design/icons";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.space.selected_space);
  const space_picked = useSelector((state) => state.sidebar.space_picked);
  const pick_a_space = useSelector((state) => state.sidebar.pick_a_space);
  const [key, setKey] = useState("mint");
  const { isAuthenticated, web3 } = useMoralis();

  const { runContractFunction, data, error, isRunning, isLoading } = useWeb3Contract({
    chain: "rinkeby",
    abi: abi.abi,
    contractAddress: "0x943b891c56f950d36126114eb37b954ea8ffa9d2",
    functionName: "mint",
    params: { geocode: 33130710591 },
  });

  useEffect(() => {
    dispatch({ type: SPACE });
  }, []);

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

  useEffect(() => {
    console.log("data:", data, "error:", error, "isRunning:", isRunning, "isLoading:", isLoading);
  }, [error, isRunning, isLoading, data]);

  const onBuy = async () => {
    const result = await Moralis.Cloud.run("test", { data: "test" });
    console.log(result);
  };

  const [count, setCount] = useState(1);

  const onPick = () => {
    dispatch({ type: PICK_A_SPACE });
  };

  const onAuction = () => {
    // fetch({ params: options });
    runContractFunction();
  };

  return (
    <div className="bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="mint" title="Mint" tabClassName="text-light ml-3">
          <div className="card-body text-center text-light mt-3">
            <div className="row justify-content-center">
              <button type="button" className="btn btn-light rounded" onClick={() => onBuy()}>
                You can buy random space
              </button>
            </div>

            <div className="qty mt-3 mb-3">
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

            <hr className="bg-light " />

            <div className="row justify-content-center mt-5">
              <button type="button" className="btn btn-light rounded" onClick={() => onPick()}>
                {space_picked ? "Pick a different Space" : "Or auction for a desired space"}
              </button>
            </div>

            {space_picked ? (
              <div className="row justify-content-center mt-5">
                <button type="button" className="btn btn-light rounded" onClick={() => onAuction()}>
                  Start the auction for this Space
                </button>
              </div>
            ) : null}
          </div>
        </Tab>

        {isAuthenticated ? <Tab eventKey="owned" title="Owned" tabClassName="text-light"></Tab> : null}
      </Tabs>
    </div>
  );
}
