import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
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
    if (spacePosition.geocode) {
      const space = {
        geocode: spacePosition.geocode,
      };
      dispatch({ type: SHOW_SPACE, payload: space });
      dispatch({ type: SELECT_SPACE, payload: space });
    }
  }, []);

  useEffect(() => {
    if (selected_space) {
      window.history.pushState("", "", `#/space/${selected_space.geocode}`);
    }
  }, [selected_space]);

  const onShow = () => {
    dispatch({ type: SHOW_SPACE, payload: selected_space });
  };

  const onMint = () => {
    // fetch({ params: options });
    runContractFunction();
  };

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

  return (
    <div className="bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="mint" title="Mint" tabClassName="text-light">
          <div className="card-body text-center text-light">
            <div className="row justify-content-center">
              <button type="button" className="btn btn-light rounded" onClick={() => onShow()}>
                Pick a Space
              </button>
            </div>
            <hr />

            {/* {selected_space ? ( */}
            <div className="row justify-content-center">
              <button type="button" className="btn btn-light rounded" onClick={() => onMint()}>
                Mint
              </button>
            </div>
            {/* ) : null} */}

            <hr />
            {/* {data ? ( */}
            <div className="row justify-content-center">
              <button type="button" className="btn btn-light rounded" onClick={() => onBuy()}>
                Buy on Opensea
              </button>
            </div>
            {/* ) : null} */}
          </div>
        </Tab>

        {isAuthenticated ? <Tab eventKey="owned" title="Owned" tabClassName="text-light"></Tab> : null}
      </Tabs>
    </div>
  );
}
