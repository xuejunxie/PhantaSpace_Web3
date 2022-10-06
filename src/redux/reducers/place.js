import { BOX_PLACED, SET_BOX_COLOR } from "../types";

const initialState = {
  box_placed: [],
  box_color: { r: "241", g: "112", b: "19", a: "1" },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case BOX_PLACED:
      return {
        ...state,
        box_placed: [...state.box_placed, action.payload],
      };

    case SET_BOX_COLOR:
      return {
        ...state,
        box_color: action.payload,
      };
    default:
      return state;
  }
}
