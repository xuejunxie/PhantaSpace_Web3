import { PLACE, UPDATE, CLICK } from "../types";

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

export const click = (NFTid) => (dispatch) => {
  dispatch({
    type: CLICK,
    payload: NFTid,
  });
};
