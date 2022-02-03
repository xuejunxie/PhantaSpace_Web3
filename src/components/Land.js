import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LAND, SELECT_LAND, SHOW_LAND } from "redux/types";

export default function Land() {
  const dispatch = useDispatch();
  var landPosition = useParams();
  const selected_land = useSelector((state) => state.land.selected_land);

  useEffect(() => {
    dispatch({ type: LAND });
    if (landPosition.longitude) {
      const land = {
        longitude: parseFloat(landPosition.longitude),
        latitude: parseFloat(landPosition.latitude),
      };
      dispatch({ type: SHOW_LAND, payload: land });
      dispatch({ type: SELECT_LAND, payload: land });
    }
  }, []);

  useEffect(() => {
    if (selected_land) {
      window.history.pushState("", "", `/land/${selected_land.longitude}/${selected_land.latitude}`);
    }
  }, [selected_land]);

  const onShow = () => {
    console.log(selected_land);
    dispatch({ type: SHOW_LAND, payload: selected_land });
  };

  const onBuy = () => {
    console.log(selected_land);
  };

  return (
    <div className="card  bg-dark">
      <div className="card-body text-center text-light">
        {selected_land ? (
          <div className="col">
            <div className="row">
              <label className="col">Longitude: </label>
              <div className="col">{selected_land.longitude}</div>
            </div>
            <div className="row">
              <label className="col">Latidue: </label>
              <div className="col">{selected_land.latitude}</div>
            </div>
          </div>
        ) : null}
        <div className="row justify-content-center">
          <button type="button" className="  btn btn-primary rounded mr-5" onClick={() => onShow()}>
            Show
          </button>
          <button type="button" className="  btn btn-primary rounded" onClick={() => onBuy()}>
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
