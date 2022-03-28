import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";
import Map from "./Map";

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

  return <Map viewerWidth={"100vw"} viewerHeight={"100vh"} />;
}
