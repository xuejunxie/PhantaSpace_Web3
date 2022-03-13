import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { SPACE, SELECT_SPACE, SHOW_SPACE } from "redux/types";

export default function Space() {
  const dispatch = useDispatch();
  var spacePosition = useParams();
  const selected_space = useSelector((state) => state.space.selected_space);

  useEffect(() => {
    dispatch({ type: SPACE });
    if (spacePosition.geocode) {
      const space = {
        geocode: spacePosition.geocode,
      };
      dispatch({ type: SHOW_SPACE, payload: space });
      dispatch({ type: SELECT_SPACE, payload: space });
    }
  }, []);

  useEffect(() => {
    if (selected_space) {
      window.history.pushState("", "", `#/space/${selected_space.geocode}`);
    }
  }, [selected_space]);

  const onShow = () => {
    dispatch({ type: SHOW_SPACE, payload: selected_space });
  };

  const onBuy = () => {};

  return (
    <div className="card  bg-dark">
      <div className="card-body text-center text-light">
        {selected_space ? (
          <div className="col">
            <div className="row">
              <label className="col">Geocode: </label>
              <div className="col">{selected_space.geocode}</div>
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
