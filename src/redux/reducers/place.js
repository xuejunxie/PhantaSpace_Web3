import { BOX_PLACED } from "../types";

const initialState = {
  box_placed: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case BOX_PLACED:
      return {
        ...state,
        box_placed: [...state.box_placed, action.payload],
      };

    default:
      return state;
  }
}
