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
    if (landPosition.geocode) {
      const land = {
        geocode: landPosition.geocode,
      };
      dispatch({ type: SHOW_LAND, payload: land });
      dispatch({ type: SELECT_LAND, payload: land });
    }
  }, []);

  useEffect(() => {
    if (selected_land) {
      window.history.pushState("", "", `#/land/${selected_land.geocode}`);
    }
  }, [selected_land]);

  const onShow = () => {
    dispatch({ type: SHOW_LAND, payload: selected_land });
  };

  const onBuy = () => {};

  return (
    <div className="card  bg-dark">
      <div className="card-body text-center text-light">
        {selected_land ? (
          <div className="col">
            <div className="row">
              <label className="col">Geocode: </label>
              <div className="col">{selected_land.geocode}</div>
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
