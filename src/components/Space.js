import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis } from "react-moralis";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.space.selected_space);
  const [key, setKey] = useState("mint");
  const { isAuthenticated, user } = useMoralis();

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

  const onBuy = () => {};

  return (
    <div className="card  bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        {isAuthenticated ? (
          <Tab eventKey="owned" title="Owned">
            <p> TEST1 </p>
          </Tab>
        ) : null}

        <Tab eventKey="hot" title="Hot">
          <p> TEST2 </p>
        </Tab>
        <Tab eventKey="mint" title="Mint">
          <p> TEST3 </p>
          <div className="card-body text-center text-light">
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onShow()}>
                Pick Space
              </button>
            </div>
            <hr />
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onShow()}>
                Mint
              </button>
            </div>
            <hr />
            <div className="row justify-content-center">
              <button type="button" className="btn btn-primary rounded" onClick={() => onBuy()}>
                Bid on Opensea
              </button>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
