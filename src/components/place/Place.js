import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PLACE_BOX, SET_BOX_COLOR } from "redux/types";
import { CirclePicker } from "react-color";
import colors from "./colors.json";
import { Tab, Tabs } from "react-bootstrap";

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

  const [colorPlalette, setColorPlalette] = React.useState(colors.colors1); // colors1 color2 color3 are from reddit place day1 day2 day3

  return (
    <div className="bg-dark text-light">
      <Tabs activeKey={"place"}>
        <Tab eventKey="place" title="Place" tabClassName="text-light">
          <div className="text-light mt-5 col">
            <h5>Left click to place a box</h5>
            <h5>Right click to remove a box</h5>
            Upgrade to
            <button
              className="ml-2 rounded-pill"
              onMouseEnter={() => setColorPlalette(colors.colors2)}
              onMouseLeave={() => setColorPlalette(colors.colors1)}
            >
              Level 2
            </button>
            <button
              className=" rounded-pill"
              onMouseEnter={() => setColorPlalette(colors.colors3)}
              onMouseLeave={() => setColorPlalette(colors.colors1)}
            >
              Level 3
            </button>
            <div className="justify-content-center mt-2">
              <CirclePicker
                colors={colorPlalette}
                circleSpacing={20}
                circleSize={38}
                onChange={(color) => setColor(color.rgb)}
                color={color}
                onChangeComplete={(color) => {
                  dispatch({ type: SET_BOX_COLOR, payload: color });
                }}
              />
            </div>
          </div>
        </Tab>
        <Tab eventKey="phanton" title="Buy Phanton" tabClassName="text-light"></Tab>
      </Tabs>
    </div>
  );
}
