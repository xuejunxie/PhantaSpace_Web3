import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SELECT_SPACE, SHOW_SPACE } from "redux/types";
import MapNFT from "./MapNFT";

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

  return <MapNFT viewerWidth={"100vw"} viewerHeight={"100vh"} />;
}
