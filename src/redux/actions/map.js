import { REMOVED, PLACE } from "../types";

export const place = (data) => (dispatch) => {
  dispatch({
    type: PLACE,
    payload: data,
  });
};

export const removed = (data) => (dispatch) => {
  dispatch({
    type: REMOVED,
    payload: data,
  });
};
