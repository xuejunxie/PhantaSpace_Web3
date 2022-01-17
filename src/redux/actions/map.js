import { PLACE, UPDATE } from "../types";

export const place = (nft) => (dispatch) => {
  dispatch({
    type: PLACE,
    payload: nft,
  });
};

export const update = (nft) => (dispatch) => {
  dispatch({
    type: UPDATE,
    payload: nft,
  });
};
