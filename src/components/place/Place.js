import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PLACE_BOX, SET_BOX_COLOR } from "redux/types";
import { CirclePicker } from "react-color";

export default function Place() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: PLACE_BOX });
  }, []);

  const [color, setColor] = React.useState({ r: "241", g: "112", b: "19", a: "1" });
  // color = {
  //   hex: '#333',
  //   rgb: {
  //     r: 51,
  //     g: 51,
  //     b: 51,
  //     a: 1,
  //   },
  //   hsl: {
  //     h: 0,
  //     s: 0,
  //     l: .20,
  //     a: 1,
  //   },
  // }

  // reddit place colors
  const colors = [
    "#FFFFFF",
    "#E4E4E4",
    "#888888",
    "#222222",
    "#FFA7D1",
    "#E50000",
    "#E59500",
    "#A06A42",
    "#E5D900",
    "#94E044",
    "#02BE01",
    "#00D3DD",
    "#0083C7",
    "#0000EA",
    "#CF6EE4",
    "#820080",
  ];

  return (
    <div className="text-light mt-5 col">
      <h5>Left click to place a box</h5>
      <h5>Right click to remove a box</h5>
      <div className="justify-content-center">
        <CirclePicker
          colors={colors}
          circleSpacing={20}
          circleSize={38}
          onChange={(color) => setColor(color.rgb)}
          color={color}
          onChangeComplete={(color) => {
            dispatch({ type: SET_BOX_COLOR, payload: color.rgb });
          }}
        />
      </div>
    </div>
  );
}
