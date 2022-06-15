import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { JUMP_IN } from "redux/types";

export default function JumpIn() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: JUMP_IN });
  }, []);

  return <div className="text-light">jumpIn</div>;
}
