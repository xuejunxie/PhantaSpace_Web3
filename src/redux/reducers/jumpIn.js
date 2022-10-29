import { KEY_PRESSED, CHECK_IN } from "../types";

const initialState = {
  key_pressed: null,
  position: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case KEY_PRESSED:
      return {
        ...state,
        key_pressed: action.payload,
      };
    case CHECK_IN:
      return {
        ...state,
        position: action.payload,
      };
    default:
      return state;
  }
}
