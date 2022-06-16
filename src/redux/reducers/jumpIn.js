import { KEY_PRESSED } from "../types";

const initialState = {
  key_pressed: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case KEY_PRESSED:
      return {
        ...state,
        key_pressed: action.payload,
      };

    default:
      return state;
  }
}
