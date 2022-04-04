import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis } from "react-moralis";
import "./Space.css";
import SpaceOwned from "./SpaceOwned";
import SpaceMint from "./SpaceMint";
import SpaceAuction from "./SpaceAuction";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.sidebar.selected_space);
  const space_tab = useSelector((state) => state.sidebar.space_tab);
  const [key, setKey] = useState("mint");
  const { isAuthenticated, web3 } = useMoralis();

  useEffect(() => {
    dispatch({ type: SPACE });
    dispatch({ type: SELECT_SPACE, payload: null });
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
    if (space_tab) {
      setKey(space_tab);
    }
  }, [space_tab]);

  return (
    <div className="bg-dark">
      <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="mint" title="Mint" tabClassName="text-light ml-1">
          <SpaceMint />
        </Tab>

        {isAuthenticated ? (
          <Tab eventKey="owned" title="Owned" tabClassName="text-light">
            <SpaceOwned />
          </Tab>
        ) : null}
        <Tab eventKey="auction" title="Auction" tabClassName="text-light">
          <SpaceAuction />
        </Tab>
      </Tabs>
    </div>
  );
}
