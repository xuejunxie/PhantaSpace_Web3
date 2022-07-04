import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { JUMP_IN } from "redux/types";

export default function JumpIn() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: JUMP_IN });
  }, []);

  return (
    <div className="text-light mt-5">
      <h5>Left click the map to fly around.</h5>
      <h5>Use W A S D to control, hold shift to speed up.</h5>
      <h5>Use Space to fly higher</h5>
      <h5>Left click again to exit the fly mode.</h5>
    </div>
  );
}
