import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PLACE_BOX,
  SET_BOX_COLOR,
  PLACE_TAB,
  LOAD_ALL_BOXES,
  BOX_PLACED_BY_OTHERS,
  BOX_DELETED_BY_OTHERS,
} from "redux/types";
import { CirclePicker } from "react-color";
import colors from "./colors.json";
import { Tab, Tabs } from "react-bootstrap";
import Phanton from "components/phanton/Phanton";
import { supabase, useAuth } from "../../supabase";

export default function Place() {
  const dispatch = useDispatch();
  const place_tab = useSelector((state) => state.place.place_tab);
  const box_placed = useSelector((state) => state.place.box_placed);
  const box_deleted = useSelector((state) => state.place.box_deleted);
  const { account } = useAuth();

  useEffect(() => {
    dispatch({ type: PLACE_BOX });
  }, []);

  // boxes placed / removed by others
  useEffect(() => {
    const channel = supabase
      .channel("live:box")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "box" }, ({ new: box }) => {
        if (!(box_placed && box_placed.geocode == box.geocode)) {
          dispatch({ type: BOX_PLACED_BY_OTHERS, payload: box });
        }
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "box" }, ({ old: box }) => {
        if (box_deleted != box.geocode) {
          dispatch({ type: BOX_DELETED_BY_OTHERS, payload: box });
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [box_placed, box_deleted]);

  useEffect(() => {
    if (box_placed && box_placed.geocode) {
      supabase
        .from("box")
        .upsert({ ...box_placed, owner: account || null })
        .then(({ error }) => error && console.error(error));
    }
  }, [box_placed]);

  useEffect(() => {
    if (box_deleted) {
      supabase
        .from("box")
        .delete()
        .eq("geocode", box_deleted)
        .then(({ error }) => error && console.error(error));
    }
  }, [box_deleted]);

  const [color, setColor] = React.useState({ r: "255", g: "255", b: "255", a: "1" });

  const [colorPlalette, setColorPlalette] = React.useState(colors.colors1); // colors1 color2 color3 are from reddit place day1 day2 day3

  return (
    <div className="bg-dark text-light">
      <Tabs
        activeKey={place_tab}
        onSelect={(k) => {
          dispatch({ type: PLACE_TAB, payload: k });
        }}
      >
        <Tab eventKey="place" title="Place" tabClassName="text-light">
          <div className="text-light mt-5 col">
            <h5>Left click to place a box</h5>
            <h5>Right click to remove a box</h5>
            <h5>Pick a color:</h5>

            {/* Upgrade to
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
            </button> */}
            <div className="justify-content-center mt-2 ml-3">
              <CirclePicker
                colors={colorPlalette}
                circleSpacing={16}
                width={"100%"}
                circleSize={34}
                onChange={(color) => setColor(color.rgb)}
                color={color}
                onChangeComplete={(color) => {
                  dispatch({ type: SET_BOX_COLOR, payload: color });
                }}
              />
            </div>
          </div>
        </Tab>
        <Tab eventKey="phanton" title="Buy Phanton" tabClassName="text-light">
          <Phanton />
        </Tab>
      </Tabs>
    </div>
  );
}
