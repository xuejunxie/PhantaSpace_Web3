import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LOAD_ALL, LOADING_ALL, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import MapNFT from "./MapNFT";

import Moralis from "moralis";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
Moralis.initialize(appId);
Moralis.serverURL = serverUrl;

const dataClass = Moralis.Object.extend("allNFT");

export default function SpaceNFT() {
  const dispatch = useDispatch();
  var spacePosition = useParams();

  useEffect(() => {
    if (spacePosition.geocode) {
      const space = {
        geocode: spacePosition.geocode,
      };
      dispatch({ type: SHOW_SPACE, payload: space });
      dispatch({ type: SELECT_SPACE, payload: space });
    }
  }, [spacePosition]);

  // useEffect(() => {
  //   const query = new Moralis.Query(dataClass);
  //   query.find().then((results) => {
  //     dispatch({ type: LOAD_ALL, payload: results.map((item) => item.attributes) });
  //     dispatch({ type: LOADING_ALL, payload: false });
  //   });
  // }, []);

  return <MapNFT viewerWidth={"100vw"} viewerHeight={"100vh"} />;
}
