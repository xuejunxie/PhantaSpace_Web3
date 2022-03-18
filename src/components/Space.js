import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "./abi.json";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.space.selected_space);
  const [key, setKey] = useState("mint");
  const { isAuthenticated } = useMoralis();

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

  useEffect(() => {
    if (isAuthenticated) {
      setKey("Owned");
    } else {
      setKey("mint");
    }
  }, [isAuthenticated]);

  const onShow = () => {
    dispatch({ type: SHOW_SPACE, payload: selected_space });
  };

  const onMint = () => {
    // fetch({ params: options });
    runContractFunction();
  };

  useEffect(() => {
    console.log(data);
    console.log("error", error);
    console.log("isRunning", isRunning);
    console.log("isLoading", isLoading);
  }, [error, isRunning, isLoading, data]);

  const onBuy = () => {};

  return (
    <div className="card  bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        {isAuthenticated ? (
          <Tab eventKey="owned" title="Owned">
            <p> TEST1 </p>
          </Tab>
        ) : null}

        <Tab eventKey="mint" title="Mint">
          <div className="card-body text-center text-light">
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onShow()}>
                Pick Space
              </button>
            </div>
            <hr />
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onMint()}>
                Mint
              </button>
            </div>
            <hr />
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onBuy()}>
                Buy on Opensea
              </button>
            </div>
            <div style={{ height: "100vh", overflow: "auto" }}></div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
