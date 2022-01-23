import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LAND } from "redux/types";

export default function Land() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: LAND });
  }, []);

  return <div></div>;
}
