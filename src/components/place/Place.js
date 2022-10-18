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
import { useMoralis, useMoralisQuery, useMoralisSubscription } from "react-moralis";
import Moralis from "moralis";

const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const boxClass = Moralis.Object.extend("box");

export default function Place() {
  const dispatch = useDispatch();
  const place_tab = useSelector((state) => state.place.place_tab);
  const box_placed = useSelector((state) => state.place.box_placed);
  var box_deleted = useSelector((state) => state.place.box_deleted);
  const { isAuthenticated, user } = useMoralis();
  const limit = 10000;

  useEffect(() => {
    dispatch({ type: PLACE_BOX });
  }, []);

  const { data, error, isLoading } = useMoralisQuery("box", (query) => query.limit(limit));

  useEffect(async () => {
    const list = [];
    if (data) {
      data.map((box) => {
        list.push(box.attributes); // attributes has auctionEndTime, geocode, highestBid, highestBidder, createdAT, updatedAT
      });
    }
    dispatch({ type: LOAD_ALL_BOXES, payload: list });
  }, [data]);

  useMoralisSubscription("box", (q) => q, [], {
    onCreate: (data) => {
      if (user == null || data.attributes.owner != user.attributes.ethAddress) {
        dispatch({ type: BOX_PLACED_BY_OTHERS, payload: data.attributes });
      }
    },
    onDelete: (data) => {
      if (user == null || data.attributes.owner != user.attributes.ethAddress) {
        dispatch({ type: BOX_DELETED_BY_OTHERS, payload: data.attributes });
      }
    },
  });

  useEffect(() => {
    var newBox = new boxClass();

    if (box_placed && box_placed.geocode) {
      if (isAuthenticated) {
        box_placed.owner = user.attributes.ethAddress;
      }
      newBox.save(box_placed).then((result) => {});
    }
  }, [box_placed]);

  useEffect(() => {
    if (box_deleted) {
      var query = new Moralis.Query(boxClass);
      query.equalTo("geocode", box_deleted);
      query.find().then((results) => {
        results[0].destroy().then((result) => {});
      });
    }
  }, [box_deleted]);

  const [color, setColor] = React.useState({ r: "255", g: "255", b: "255", a: "1" });

  const [colorPlalette, setColorPlalette] = React.useState(colors.colors3); // colors1 color2 color3 are from reddit place day1 day2 day3

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
