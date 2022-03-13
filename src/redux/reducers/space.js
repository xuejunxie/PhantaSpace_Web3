import { SELECT_SPACE } from "../types";

const initialState = {
  selected_space: null,
  show_space: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT_SPACE:
      return {
        ...state,
        selected_space: action.payload,
      };
    case "SHOW_SPACE":
      return {
        ...state,
        show_space: action.payload,
      };

    default:
      return state;
  }
}
