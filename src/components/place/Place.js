import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PLACE_BOX } from "redux/types";

export default function Place() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: PLACE_BOX });
  }, []);

  return (
    <div className="text-light mt-5">
      <h5>Left click the map to place a box</h5>
    </div>
  );
}
