import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, PICK_A_SPACE, SELECT_SPACE, SHOW_SPACE, LOAD_ALL_SPACES, SHOW_ALL_SPACES } from "redux/types";
import { Tab, Tabs } from "react-bootstrap";
import { useMoralis, useMoralisQuery } from "react-moralis";
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
  const all_space = useSelector((state) => state.space.all);
  const limit = 10000;

  // deal with time

  const [date, setDate] = useState(new Date());
  const startTime = Date.parse("16 APR 2022 17:00:00 PST");

  function refreshClock() {
    setDate(new Date());
  }

  function timeString(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor((time / 60) % 60);
    const hours = Math.floor(time / 60 / 60) % 24;
    const days = Math.floor(time / 60 / 60 / 24);

    return (
      <div className="mt-3">
        <h2> {hours} hours </h2>
        <h2> {minutes} minutes </h2>
        <h2> {seconds} seconds </h2>
      </div>
    );
  }

  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  // get live with space list
  const { data, error, isLoading } = useMoralisQuery(
    "space",
    (query) =>
      // query all
      query.limit(limit),
    [limit],
    {
      live: true,
      onLiveEnter: (entity, all) => [...all, entity],
      onLiveCreate: (entity, all) => [...all, entity],
      onLiveDelete: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveLeave: (entity, all) => all.filter((e) => e.id !== entity.id),
      onLiveUpdate: (entity, all) => all.map((e) => (e.id === entity.id ? entity : e)),
    }
  );

  useEffect(async () => {
    const list = [];
    if (data) {
      data.map((auction) => {
        list.push(auction.attributes); // attributes has auctionEndTime, geocode, highestBid, highestBidder, createdAT, updatedAT
      });
    }
    dispatch({ type: LOAD_ALL_SPACES, payload: list });
  }, [data]);

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
    dispatch({ type: SHOW_ALL_SPACES, payload: true });
  }, []);

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
    <div className="bg-dark text-light">
      {startTime > date ? (
        <h2 className="mt-5"> Initial space offering on-chain auction in: {timeString((startTime - date) / 1000)} </h2>
      ) : (
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
      )}
    </div>
  );
}
