import { CLICK_LAND } from "../types";

const initialState = {
  selected_land: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case CLICK_LAND:
      return {
        ...state,
        selected_land: action.payload,
      };
    default:
      return state;
  }
}
