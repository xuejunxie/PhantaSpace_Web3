import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { LAND } from "redux/types";

export default function Land() {
  const dispatch = useDispatch();
  var { longitude, latitude } = useParams();

  useEffect(() => {
    dispatch({ type: LAND });
    console.log(longitude, latitude);
  }, []);

  return <div></div>;
}
