import { SELECT_LAND } from "../types";

const initialState = {
  selected_land: null,
  show_land: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT_LAND:
      return {
        ...state,
        selected_land: action.payload,
      };
    case "SHOW_LAND":
      return {
        ...state,
        show_land: action.payload,
      };

    default:
      return state;
  }
}
